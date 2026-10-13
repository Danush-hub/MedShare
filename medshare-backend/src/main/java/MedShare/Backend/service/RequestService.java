package MedShare.Backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import MedShare.Backend.domain.Activity;
import MedShare.Backend.domain.EquipmentRequest;
import MedShare.Backend.domain.MedicalEquipment;
import MedShare.Backend.domain.StatusEvent;
import MedShare.Backend.domain.enums.ActivityType;
import MedShare.Backend.domain.enums.EquipmentAvailability;
import MedShare.Backend.domain.enums.RequestStatus;
import MedShare.Backend.dto.RequestDraft;
import MedShare.Backend.store.WorkspaceStore;
import MedShare.Backend.web.error.ConflictException;
import MedShare.Backend.web.error.NotFoundException;
import MedShare.Backend.web.error.ValidationException;

/**
 * Equipment-request workflow over the in-memory {@link WorkspaceStore}. Mirrors
 * the frontend reference implementation ({@code src/services/mock/requests.ts},
 * the store reducer in {@code src/features/workspace/store.tsx} and the rules in
 * {@code src/features/workspace/rules.ts}):
 * <ul>
 *   <li>creation validates the draft, resolves {@code equipmentName}, and starts
 *       the request {@code Pending} with a "Request submitted." history entry —
 *       it does NOT reserve inventory;</li>
 *   <li>approval (only from {@code Pending}) re-checks live availability and
 *       reserves the requested units against the equipment listing;</li>
 *   <li>rejection requires a non-blank reason and records it on the request;</li>
 *   <li>cancellation (only from {@code Pending}) restores nothing because a
 *       pending request never reserved units in this model;</li>
 *   <li>every successful mutation appends an activity entry, newest-first.</li>
 * </ul>
 * The mutation methods are {@code synchronized} so the request/inventory updates
 * of one approval land atomically, like the frontend's single-pass reducer.
 */
@Service
public class RequestService {

	/** Availability states that must not accept new borrow requests ({@code rules.ts}). */
	private static final Set<EquipmentAvailability> NON_REQUESTABLE_AVAILABILITY = Set.of(
		EquipmentAvailability.UNAVAILABLE,
		EquipmentAvailability.UNDER_MAINTENANCE,
		EquipmentAvailability.RETIRED);

	private final WorkspaceStore store;

	public RequestService(WorkspaceStore store) {
		this.store = store;
	}

	public List<EquipmentRequest> listRequests() {
		return store.getRequests();
	}

	public EquipmentRequest getRequest(String id) {
		return findRequest(id);
	}

	public synchronized EquipmentRequest createRequest(RequestDraft draft) {
		validateDraft(draft);

		MedicalEquipment equipment = store.getEquipmentById(draft.equipmentId())
			.orElseThrow(() -> new NotFoundException(
				"The selected equipment listing " + draft.equipmentId() + " no longer exists."));
		// Both institutions must exist (404), consistent with the equipment check.
		requireInstitution(draft.requestingInstitutionId());
		requireInstitution(draft.supplyingInstitutionId());
		// Equipment under maintenance, retired or flagged unavailable cannot be borrowed.
		String availabilityBlocker = availabilityBlocker(equipment);
		if (availabilityBlocker != null) {
			throw new ConflictException(availabilityBlocker);
		}
		// Availability can change while a request form is open — re-check live.
		if (draft.quantity() > equipment.availableQuantity()) {
			throw new ConflictException("Availability changed while the request was being prepared: only "
				+ equipment.availableQuantity() + " unit(s) of " + equipment.name() + " remain unreserved.");
		}

		String at = nowIso();
		EquipmentRequest created = new EquipmentRequest(
			store.nextRequestId(),
			equipment.id(),
			equipment.name(),
			draft.requestingInstitutionId(),
			draft.supplyingInstitutionId(),
			draft.quantity(),
			draft.purpose().trim(),
			draft.requestedDate(),
			draft.requiredDate(),
			draft.expectedReturnDate(),
			draft.deliveryLocation().trim(),
			blankToNull(draft.notes()),
			RequestStatus.PENDING,
			null,
			at,
			at,
			List.of(new StatusEvent("Pending", at, "Request submitted.")));
		store.putRequest(created);
		store.addActivity(new Activity(store.nextActivityId(), ActivityType.REQUEST_SUBMITTED,
			"Submitted request " + created.id() + " for " + created.equipmentName() + ".",
			created.id(), "Pending", at));
		return created;
	}

	public synchronized EquipmentRequest approveRequest(String id, String note) {
		EquipmentRequest existing = findRequest(id);
		// Port of requestApprovalBlocker: approval is Pending-only and re-checks
		// live equipment state; every failure is a 409 CONFLICT.
		if (existing.status() != RequestStatus.PENDING) {
			throw new ConflictException("Only Pending requests can be approved (this one is "
				+ existing.status().getLabel().toLowerCase() + ").");
		}
		MedicalEquipment equipment = store.getEquipmentById(existing.equipmentId())
			.orElseThrow(() -> new ConflictException(
				"The linked equipment listing no longer exists in the inventory."));
		String availabilityBlocker = availabilityBlocker(equipment);
		if (availabilityBlocker != null) {
			throw new ConflictException(availabilityBlocker);
		}
		if (equipment.availableQuantity() < existing.quantity()) {
			throw new ConflictException("Availability has changed since this request was submitted: only "
				+ equipment.availableQuantity() + " of the " + existing.quantity()
				+ " requested unit(s) of " + equipment.name() + " remain unreserved.");
		}

		String at = nowIso();
		String historyNote = "Request approved. " + existing.quantity()
			+ " unit(s) reserved against " + equipment.id() + ".";
		if (note != null && !note.isBlank()) {
			historyNote = historyNote + " " + note.trim();
		}
		EquipmentRequest approved = withStatus(existing, RequestStatus.APPROVED, null, at,
			new StatusEvent("Approved", at, historyNote));
		// Reserve the approved units so later requests/approvals see the change.
		int reservedQuantity = equipment.availableQuantity() - existing.quantity();
		store.putEquipment(new MedicalEquipment(
			equipment.id(),
			equipment.name(),
			equipment.category(),
			equipment.institutionId(),
			equipment.internalReference(),
			equipment.quantity(),
			reservedQuantity,
			equipment.city(),
			equipment.condition(),
			EquipmentService.normalizeAvailability(equipment.availability(), reservedQuantity, equipment.quantity()),
			equipment.description(),
			equipment.maintenanceNotes(),
			equipment.availableFrom(),
			equipment.availableUntil(),
			equipment.documentationOnFile(),
			at));
		store.putRequest(approved);
		store.addActivity(new Activity(store.nextActivityId(), ActivityType.REQUEST_APPROVED,
			"Approved request " + approved.id() + " for " + approved.equipmentName() + ". "
				+ existing.quantity() + " unit(s) reserved.",
			approved.id(), "Approved", at));
		return approved;
	}

	public synchronized EquipmentRequest rejectRequest(String id, String reason) {
		EquipmentRequest existing = findRequest(id);
		// Frontend order: the reason is validated before the status guard.
		if (reason == null || reason.isBlank()) {
			throw new ValidationException("A rejection reason is required.",
				Map.of("reason", List.of("Reason is required.")));
		}
		requirePending(existing, "rejected");
		String trimmed = reason.trim();
		String at = nowIso();
		EquipmentRequest rejected = withStatus(existing, RequestStatus.REJECTED, trimmed, at,
			new StatusEvent("Rejected", at, trimmed));
		store.putRequest(rejected);
		store.addActivity(new Activity(store.nextActivityId(), ActivityType.REQUEST_REJECTED,
			"Rejected request " + rejected.id() + " for " + rejected.equipmentName() + ".",
			rejected.id(), "Rejected", at));
		return rejected;
	}

	public synchronized EquipmentRequest cancelRequest(String id) {
		EquipmentRequest existing = findRequest(id);
		requirePending(existing, "cancelled");
		String at = nowIso();
		EquipmentRequest cancelled = withStatus(existing, RequestStatus.CANCELLED, null, at,
			new StatusEvent("Cancelled", at, "Cancelled by requester."));
		store.putRequest(cancelled);
		store.addActivity(new Activity(store.nextActivityId(), ActivityType.REQUEST_CANCELLED,
			"Cancelled request " + cancelled.id() + " for " + cancelled.equipmentName() + ".",
			cancelled.id(), "Cancelled", at));
		// No inventory release: only Pending requests can be cancelled and a
		// Pending request never reserved units (approval is what reserves).
		return cancelled;
	}

	// --- helpers -------------------------------------------------------------

	private EquipmentRequest findRequest(String id) {
		return store.getRequestById(id)
			.orElseThrow(() -> new NotFoundException("Request " + id + " no longer exists."));
	}

	private void requireInstitution(String institutionId) {
		store.getHospitalById(institutionId)
			.orElseThrow(() -> new NotFoundException(
				"Institution " + institutionId + " was not found."));
	}

	private static void requirePending(EquipmentRequest request, String verb) {
		if (request.status() != RequestStatus.PENDING) {
			throw new ConflictException("Only Pending requests can be " + verb
				+ " (this one is " + request.status().getLabel().toLowerCase() + ").");
		}
	}

	/** Status transition applied to an existing record: history append + updatedAt. */
	private static EquipmentRequest withStatus(
		EquipmentRequest existing, RequestStatus status, String rejectReason, String at, StatusEvent event) {
		List<StatusEvent> history = new ArrayList<>(existing.history());
		history.add(event);
		return new EquipmentRequest(
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
			status,
			rejectReason != null ? rejectReason : existing.rejectReason(),
			existing.createdAt(),
			at,
			history);
	}

	/**
	 * Field validation merged from the frontend request form
	 * ({@code RequestEquipmentModal.validate}) and the mock request service —
	 * both surface as {@code 400 VALIDATION_ERROR} with field details.
	 */
	private static void validateDraft(RequestDraft draft) {
		Map<String, List<String>> details = new LinkedHashMap<>();
		if (draft.quantity() < 1) {
			details.put("quantity", List.of("Quantity must be 1 or more."));
		}
		if (draft.purpose() == null || draft.purpose().isBlank()) {
			details.put("purpose", List.of("Purpose is required."));
		}
		if (draft.requiredDate() == null || draft.requiredDate().isBlank()) {
			details.put("requiredDate", List.of("Choose a required date."));
		}
		if (draft.expectedReturnDate() == null || draft.expectedReturnDate().isBlank()) {
			details.put("expectedReturnDate", List.of("Choose an expected return date."));
		} else if (draft.requiredDate() != null && !draft.requiredDate().isBlank()
			&& draft.expectedReturnDate().compareTo(draft.requiredDate()) < 0) {
			details.put("expectedReturnDate", List.of("Return date must be on or after the required date."));
		}
		if (draft.deliveryLocation() == null || draft.deliveryLocation().isBlank()) {
			details.put("deliveryLocation", List.of("Provide a delivery location."));
		}
		if (!details.isEmpty()) {
			throw new ValidationException("Please fix the highlighted fields before submitting.", details);
		}
	}

	/** Port of {@code requestAvailabilityBlocker} from {@code rules.ts}. */
	private static String availabilityBlocker(MedicalEquipment equipment) {
		if (!NON_REQUESTABLE_AVAILABILITY.contains(equipment.availability())) {
			return null;
		}
		return switch (equipment.availability()) {
			case UNDER_MAINTENANCE -> equipment.name() + " is flagged Under Maintenance and cannot be requested until servicing is complete.";
			case RETIRED -> equipment.name() + " has been Retired and is no longer available to share.";
			default -> equipment.name() + " has been flagged Unavailable by its owner.";
		};
	}

	private static String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private static String nowIso() {
		// ISO-8601 UTC with Z suffix, second precision (matches contract timestamps).
		return Instant.now().truncatedTo(ChronoUnit.SECONDS).toString();
	}
}
