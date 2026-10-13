package MedShare.Backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import MedShare.Backend.domain.Activity;
import MedShare.Backend.domain.EquipmentRequest;
import MedShare.Backend.domain.EquipmentTransfer;
import MedShare.Backend.domain.MedicalEquipment;
import MedShare.Backend.domain.StatusEvent;
import MedShare.Backend.domain.enums.ActivityType;
import MedShare.Backend.domain.enums.RequestStatus;
import MedShare.Backend.domain.enums.TransferStatus;
import MedShare.Backend.dto.TransferTransitionOptionsDto;
import MedShare.Backend.store.WorkspaceStore;
import MedShare.Backend.web.error.ConflictException;
import MedShare.Backend.web.error.NotFoundException;
import MedShare.Backend.web.error.ValidationException;

/**
 * Equipment transfer workflow over the in-memory {@link WorkspaceStore}. Mirrors
 * the frontend reference implementation ({@code src/services/mock/transfers.ts},
 * the {@code transfer/*} reducer cases in
 * {@code src/features/workspace/store.tsx} and {@code TRANSFER_FLOW} in
 * {@code src/features/workspace/rules.ts}):
 * <ul>
 *   <li>transfers are prepared only from {@code Approved} requests, one per
 *       request; creating one does NOT touch inventory because the units were
 *       already reserved at approval;</li>
 *   <li>status moves follow the strict {@code TRANSFER_FLOW} graph and every
 *       illegal move is a {@code 409 CONFLICT};</li>
 *   <li>the {@code Dispatched}/{@code Received}/{@code Returned}/{@code Completed}
 *       milestones mirror onto the linked request's status and history;</li>
 *   <li>reserved units are released only when the transfer reaches
 *       {@code Completed} — receipt does not imply return — and because
 *       {@code Completed} is terminal in the flow graph, the release can never
 *       run twice for one transfer;</li>
 *   <li>every successful mutation appends the matching activity entry.</li>
 * </ul>
 * Like {@link RequestService}, mutations are {@code synchronized} so the
 * transfer, linked request, equipment and activity updates land atomically.
 * The sender/receiver actor checks (TRANSFER_ACTOR, contract 403s) are deferred
 * to the future authentication phase and not enforced here.
 */
@Service
public class TransferService {

	/** Port of {@code TRANSFER_FLOW} from {@code rules.ts}; Completed is terminal. */
	private static final Map<TransferStatus, List<TransferStatus>> TRANSFER_FLOW = Map.of(
		TransferStatus.AWAITING_DISPATCH, List.of(TransferStatus.DISPATCHED),
		TransferStatus.DISPATCHED, List.of(TransferStatus.IN_TRANSIT, TransferStatus.RECEIVED),
		TransferStatus.IN_TRANSIT, List.of(TransferStatus.RECEIVED),
		TransferStatus.RECEIVED, List.of(TransferStatus.RETURN_SCHEDULED, TransferStatus.COMPLETED),
		TransferStatus.RETURN_SCHEDULED, List.of(TransferStatus.RETURNED),
		TransferStatus.RETURNED, List.of(TransferStatus.COMPLETED),
		TransferStatus.COMPLETED, List.of());

	/** Transfer milestones mirrored onto the linked request (reducer {@code requestMirror}). */
	private static final Map<TransferStatus, RequestStatus> REQUEST_MIRROR = Map.of(
		TransferStatus.DISPATCHED, RequestStatus.DISPATCHED,
		TransferStatus.RECEIVED, RequestStatus.RECEIVED,
		TransferStatus.RETURNED, RequestStatus.RETURNED,
		TransferStatus.COMPLETED, RequestStatus.COMPLETED);

	/** Stages accepted by the {@code /return} endpoint (contract §5.6). */
	private static final Set<String> RETURN_STAGES = Set.of("Return Scheduled", "Returned", "Completed");

	/**
	 * Which side of a transfer owns each target status. Port of {@code TRANSFER_ACTOR}
	 * from {@code src/features/workspace/rules.ts}; used only to derive the
	 * {@link #getTransitionOptions(String)} split for the UI, never to gate the
	 * mutation routes (actor/403 enforcement stays deferred with authentication).
	 */
	private static final Map<TransferStatus, String> TRANSFER_ACTOR = Map.of(
		TransferStatus.AWAITING_DISPATCH, "sending",
		TransferStatus.DISPATCHED, "sending",
		TransferStatus.IN_TRANSIT, "sending",
		TransferStatus.RECEIVED, "receiving",
		TransferStatus.RETURN_SCHEDULED, "receiving",
		TransferStatus.RETURNED, "sending",
		TransferStatus.COMPLETED, "sending");

	private final WorkspaceStore store;

	public TransferService(WorkspaceStore store) {
		this.store = store;
	}

	public List<EquipmentTransfer> listTransfers() {
		return store.getTransfers();
	}

	public EquipmentTransfer getTransfer(String id) {
		return findTransfer(id);
	}

	public synchronized EquipmentTransfer createTransfer(String requestId) {
		EquipmentRequest request = store.getRequestById(requestId)
			.orElseThrow(() -> new NotFoundException("Request " + requestId + " no longer exists."));
		// Workflow constraint: requests require approval before dispatch.
		if (request.status() != RequestStatus.APPROVED) {
			throw new ConflictException("Only Approved requests can be prepared for dispatch (this one is "
				+ request.status().getLabel().toLowerCase() + ").");
		}
		if (store.getTransfers().stream().anyMatch(t -> t.requestId().equals(requestId))) {
			throw new ConflictException("A transfer has already been prepared for this request.");
		}
		// Defensive: listings referenced by open requests cannot be deleted, but the
		// request may predate a direct store change; mirror the approval blocker.
		store.getEquipmentById(request.equipmentId())
			.orElseThrow(() -> new ConflictException(
				"The linked equipment listing no longer exists in the inventory."));
		// Quantity and institutions need no re-validation: the request was created
		// through RequestService, which enforced both, and requests are immutable.

		String at = nowIso();
		EquipmentTransfer created = new EquipmentTransfer(
			store.nextTransferId(),
			request.id(),
			request.equipmentId(),
			request.equipmentName(),
			request.supplyingInstitutionId(),
			request.requestingInstitutionId(),
			request.quantity(),
			null,
			request.expectedReturnDate(),
			"Prepared from approved request.",
			TransferStatus.AWAITING_DISPATCH,
			at,
			at,
			List.of(new StatusEvent("Awaiting Dispatch", at, "Prepared from approved request.")));
		store.putTransfer(created);
		store.addActivity(new Activity(store.nextActivityId(), ActivityType.TRANSFER_CREATED,
			"Prepared transfer " + created.id() + " for " + created.equipmentName() + ".",
			created.id(), "Awaiting Dispatch", at));
		return created;
	}

	public synchronized EquipmentTransfer dispatch(String id, String note) {
		return advance(id, TransferStatus.DISPATCHED, note);
	}

	public synchronized EquipmentTransfer receive(String id, String note) {
		return advance(id, TransferStatus.RECEIVED, note);
	}

	public synchronized EquipmentTransfer recordReturnStage(String id, String stage, String note) {
		if (stage == null || !RETURN_STAGES.contains(stage)) {
			throw new ValidationException("Please fix the highlighted fields before submitting.",
				Map.of("stage", List.of("stage must be one of: Return Scheduled, Returned, Completed.")));
		}
		TransferStatus target = TransferStatus.fromLabel(stage);
		return advance(id, target, note);
	}

	/**
	 * Compatibility entry for the frontend's generic
	 * {@code updateTransferStatus(id, status, note?)} contract. It routes any
	 * valid target status through the SAME validated {@link #advance} transition
	 * used by the dedicated {@code /dispatch}, {@code /receive} and {@code /return}
	 * routes, so lifecycle rules, request mirroring and reservation release behave
	 * identically. This also makes {@code In Transit} reachable — the one legal
	 * flow step the dedicated action routes never exposed. An illegal next step
	 * (or {@code Awaiting Dispatch}, which is only ever a starting state) surfaces
	 * as {@code 409 CONFLICT}, exactly as the dedicated routes do.
	 */
	public synchronized EquipmentTransfer updateStatus(String id, TransferStatus status, String note) {
		if (status == null) {
			throw new ValidationException("Please fix the highlighted fields before submitting.",
				Map.of("status", List.of("status is required.")));
		}
		return advance(id, status, note);
	}

	/**
	 * Port of {@code transferTransitionOptions(transfer, currentInstitutionId)}
	 * from {@code rules.ts}: splits the valid next statuses into the ones the
	 * acting institution may record now and those its counterpart owns. Uses the
	 * store's current institution as the actor (no auth yet). This backs the
	 * frontend {@code getTransitionOptions} contract without changing any mutation
	 * route's behavior.
	 */
	public TransferTransitionOptionsDto getTransitionOptions(String id) {
		EquipmentTransfer transfer = findTransfer(id);
		String actorId = store.getCurrentInstitutionId();
		List<TransferStatus> next = TRANSFER_FLOW.getOrDefault(transfer.status(), List.of());
		boolean isSender = actorId.equals(transfer.sendingInstitutionId());
		boolean isReceiver = actorId.equals(transfer.receivingInstitutionId());
		if (!isSender && !isReceiver) {
			// A third-party institution sees every next step as counterpart-owned.
			return new TransferTransitionOptionsDto(List.of(), next);
		}
		List<TransferStatus> available = next.stream()
			.filter(status -> {
				String actor = TRANSFER_ACTOR.get(status);
				return isSender ? "sending".equals(actor) : "receiving".equals(actor);
			})
			.toList();
		List<TransferStatus> counterpartOwned = next.stream()
			.filter(status -> !available.contains(status))
			.toList();
		return new TransferTransitionOptionsDto(available, counterpartOwned);
	}

	// --- helpers -------------------------------------------------------------

	private EquipmentTransfer findTransfer(String id) {
		return store.getTransferById(id)
			.orElseThrow(() -> new NotFoundException("Transfer " + id + " no longer exists."));
	}

	/** Port of the {@code transfer/advance} reducer case. */
	private EquipmentTransfer advance(String id, TransferStatus target, String note) {
		EquipmentTransfer existing = findTransfer(id);
		if (!TRANSFER_FLOW.getOrDefault(existing.status(), List.of()).contains(target)) {
			throw new ConflictException(target.getLabel() + " is not a valid next step for "
				+ existing.id() + " (currently " + existing.status().getLabel() + ").");
		}
		String at = nowIso();
		String timelineNote = note != null && !note.isBlank() ? note.trim() : "Marked " + target.getLabel() + ".";
		List<StatusEvent> timeline = new ArrayList<>(existing.timeline());
		timeline.add(new StatusEvent(target.getLabel(), at, timelineNote));
		EquipmentTransfer updated = new EquipmentTransfer(
			existing.id(),
			existing.requestId(),
			existing.equipmentId(),
			existing.equipmentName(),
			existing.sendingInstitutionId(),
			existing.receivingInstitutionId(),
			existing.quantity(),
			target == TransferStatus.DISPATCHED && existing.dispatchDate() == null
				? at.substring(0, 10)
				: existing.dispatchDate(),
			existing.expectedReturn(),
			existing.handoverNotes(),
			target,
			existing.createdAt(),
			at,
			timeline);
		store.putTransfer(updated);

		mirrorOntoLinkedRequest(updated, target, at);
		if (target == TransferStatus.COMPLETED) {
			releaseReservation(updated, at);
		}
		store.addActivity(new Activity(store.nextActivityId(), ActivityType.TRANSFER_UPDATED,
			"Transfer " + updated.id() + " (" + updated.equipmentName() + ") marked " + target.getLabel() + ".",
			updated.id(), target.getLabel(), at));
		return updated;
	}

	/** Keep the linked request's status/history in step with key milestones. */
	private void mirrorOntoLinkedRequest(EquipmentTransfer transfer, TransferStatus target, String at) {
		RequestStatus mirrored = REQUEST_MIRROR.get(target);
		if (mirrored == null) {
			return;
		}
		Optional<EquipmentRequest> linked = store.getRequestById(transfer.requestId());
		if (linked.isEmpty()) {
			return;
		}
		EquipmentRequest existing = linked.get();
		List<StatusEvent> history = new ArrayList<>(existing.history());
		history.add(new StatusEvent(mirrored.getLabel(), at, "Transfer " + target.getLabel() + "."));
		store.putRequest(new EquipmentRequest(
			existing.id(),
			existing.equipmentId(),
			existing.equipmentName(),
			existing.requestingInstitutionId(),
			existing.supplyingInstitutionId(),
			existing.quantity(),
			existing.purpose(),
			existing.requestedDate(),
			existing.requiredDate(),
			existing.expectedReturnDate(),
			existing.deliveryLocation(),
			existing.notes(),
			mirrored,
			existing.rejectReason(),
			existing.createdAt(),
			at,
			history));
	}

	/**
	 * Completion is the owner's confirmation that the units came back and were
	 * checked: only now is the reservation released back to inventory (returning
	 * alone does not). Double release is impossible because {@code Completed}
	 * is terminal in {@code TRANSFER_FLOW} — a completed transfer can never
	 * re-enter this branch — and the clamp keeps the count within the listing.
	 */
	private void releaseReservation(EquipmentTransfer transfer, String at) {
		store.getEquipmentById(transfer.equipmentId()).ifPresent(equipment -> {
			int releasedQuantity = Math.min(
				equipment.quantity(), equipment.availableQuantity() + transfer.quantity());
			store.putEquipment(new MedicalEquipment(
				equipment.id(),
				equipment.name(),
				equipment.category(),
				equipment.institutionId(),
				equipment.internalReference(),
				equipment.quantity(),
				releasedQuantity,
				equipment.city(),
				equipment.condition(),
				EquipmentService.normalizeAvailability(
					equipment.availability(), releasedQuantity, equipment.quantity()),
				equipment.description(),
				equipment.maintenanceNotes(),
				equipment.availableFrom(),
				equipment.availableUntil(),
				equipment.documentationOnFile(),
				at));
		});
	}

	private static String nowIso() {
		// ISO-8601 UTC with Z suffix, second precision (matches contract timestamps).
		return Instant.now().truncatedTo(ChronoUnit.SECONDS).toString();
	}
}
