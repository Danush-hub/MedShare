package MedShare.Backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import MedShare.Backend.domain.EquipmentRequest;
import MedShare.Backend.domain.EquipmentTransfer;
import MedShare.Backend.domain.MedicalEquipment;
import MedShare.Backend.domain.enums.EquipmentAvailability;
import MedShare.Backend.domain.enums.RequestStatus;
import MedShare.Backend.domain.enums.TransferStatus;
import MedShare.Backend.dto.EquipmentDraft;
import MedShare.Backend.store.WorkspaceStore;
import MedShare.Backend.web.error.ConflictException;
import MedShare.Backend.web.error.NotFoundException;
import MedShare.Backend.web.error.ValidationException;

/**
 * Equipment CRUD over the in-memory {@link WorkspaceStore}. Mirrors the frontend
 * reference implementation ({@code src/services/mock/equipment.ts} plus the
 * business rules in {@code src/features/workspace/rules.ts}):
 * <ul>
 *   <li>create/update validate the draft and derive the {@code availability}
 *       label from the unit counts (manual lifecycle flags are preserved);</li>
 *   <li>the server assigns {@code id} and {@code updatedAt};</li>
 *   <li>deletion is blocked (409) while open requests or active transfers
 *       reference the listing.</li>
 * </ul>
 */
@Service
public class EquipmentService {

	/** Availability states set manually by owners; never auto-recomputed from unit counts. */
	private static final Set<EquipmentAvailability> MANUAL_AVAILABILITY = Set.of(
		EquipmentAvailability.UNAVAILABLE,
		EquipmentAvailability.UNDER_MAINTENANCE,
		EquipmentAvailability.RETIRED);

	/** Request statuses that still count as "open" for the delete-consistency check. */
	private static final Set<RequestStatus> OPEN_REQUEST_STATUSES = Set.of(
		RequestStatus.PENDING,
		RequestStatus.APPROVED,
		RequestStatus.DISPATCHED,
		RequestStatus.RECEIVED);

	private final WorkspaceStore store;

	public EquipmentService(WorkspaceStore store) {
		this.store = store;
	}

	public List<MedicalEquipment> listEquipment() {
		return store.getEquipment();
	}

	public MedicalEquipment getEquipment(String id) {
		return findEquipment(id);
	}

	public MedicalEquipment createEquipment(EquipmentDraft draft) {
		validateDraft(draft);
		// Contract §3.3: unknown institutionId is a 404.
		store.getHospitalById(draft.institutionId())
			.orElseThrow(() -> new NotFoundException("Institution " + draft.institutionId() + " was not found."));

		MedicalEquipment created = new MedicalEquipment(
			store.nextEquipmentId(),
			draft.name(),
			draft.category(),
			draft.institutionId(),
			draft.internalReference(),
			draft.quantity(),
			draft.availableQuantity(),
			draft.city(),
			draft.condition(),
			normalizeAvailability(draft.availability(), draft.availableQuantity(), draft.quantity()),
			draft.description(),
			draft.maintenanceNotes(),
			draft.availableFrom(),
			draft.availableUntil(),
			draft.documentationOnFile(),
			nowIso());
		store.putEquipment(created);
		return created;
	}

	public MedicalEquipment updateEquipment(String id, EquipmentDraft draft) {
		MedicalEquipment existing = findEquipment(id);
		validateDraft(draft);

		MedicalEquipment updated = new MedicalEquipment(
			existing.id(),
			draft.name(),
			draft.category(),
			draft.institutionId(),
			draft.internalReference(),
			draft.quantity(),
			draft.availableQuantity(),
			draft.city(),
			draft.condition(),
			normalizeAvailability(draft.availability(), draft.availableQuantity(), draft.quantity()),
			draft.description(),
			draft.maintenanceNotes(),
			draft.availableFrom(),
			draft.availableUntil(),
			draft.documentationOnFile(),
			nowIso());
		store.putEquipment(updated);
		return updated;
	}

	public void deleteEquipment(String id) {
		findEquipment(id);
		String blocker = deleteBlocker(id);
		if (blocker != null) {
			throw new ConflictException(blocker);
		}
		store.removeEquipment(id);
	}

	// --- helpers -------------------------------------------------------------

	private MedicalEquipment findEquipment(String id) {
		return store.getEquipmentById(id)
			.orElseThrow(() -> new NotFoundException("Equipment listing " + id + " no longer exists."));
	}

	/** Port of {@code equipmentDeleteBlocker} from {@code rules.ts}. */
	private String deleteBlocker(String equipmentId) {
		EquipmentTransfer activeTransfer = store.getTransfers().stream()
			.filter(t -> t.equipmentId().equals(equipmentId))
			.filter(t -> t.status() != TransferStatus.COMPLETED)
			.findFirst()
			.orElse(null);
		if (activeTransfer != null) {
			return "This listing is part of an active transfer (" + activeTransfer.id() + " — "
				+ activeTransfer.status().getLabel() + "). Complete the transfer before removing it.";
		}
		EquipmentRequest openRequest = store.getRequests().stream()
			.filter(r -> r.equipmentId().equals(equipmentId))
			.filter(r -> OPEN_REQUEST_STATUSES.contains(r.status()))
			.findFirst()
			.orElse(null);
		if (openRequest != null) {
			return "This listing has an open request (" + openRequest.id() + " — "
				+ openRequest.status().getLabel() + "). Resolve the request before removing it.";
		}
		return null;
	}

	/** Port of {@code validateDraft} from {@code src/services/mock/equipment.ts}. */
	private static void validateDraft(EquipmentDraft draft) {
		Map<String, List<String>> details = new LinkedHashMap<>();
		if (draft.name() == null || draft.name().isBlank()) {
			details.put("name", List.of("Equipment name is required."));
		}
		if (draft.city() == null || draft.city().isBlank()) {
			details.put("city", List.of("Location (city) is required."));
		}
		if (draft.quantity() < 1) {
			details.put("quantity", List.of("Total quantity must be at least 1."));
		}
		if (draft.availableQuantity() < 0) {
			details.put("availableQuantity", List.of("Available quantity cannot be negative."));
		} else if (draft.availableQuantity() > draft.quantity()) {
			details.put("availableQuantity", List.of("Available quantity cannot exceed the total quantity."));
		}
		if (draft.availableFrom() != null && draft.availableUntil() != null
			&& draft.availableFrom().compareTo(draft.availableUntil()) > 0) {
			details.put("availableFrom", List.of("\"Available from\" must be before \"available until\"."));
		}
		if (!details.isEmpty()) {
			throw new ValidationException("Please fix the highlighted fields before saving.", details);
		}
	}

	/** Port of {@code recalcAvailability} from {@code rules.ts}. Package-private so
	 * {@link RequestService} can re-derive the label when approvals reserve units. */
	static EquipmentAvailability normalizeAvailability(
		EquipmentAvailability current, int availableQuantity, int total) {
		if (current != null && MANUAL_AVAILABILITY.contains(current)) {
			return current;
		}
		if (availableQuantity <= 0) {
			return EquipmentAvailability.RESERVED;
		}
		if (availableQuantity >= total) {
			return EquipmentAvailability.AVAILABLE;
		}
		return EquipmentAvailability.PARTIALLY_AVAILABLE;
	}

	private static String nowIso() {
		// ISO-8601 UTC with Z suffix, second precision (matches contract timestamps).
		return Instant.now().truncatedTo(ChronoUnit.SECONDS).toString();
	}
}
