package MedShare.Backend.dto;

/**
 * Create payload for a borrow request (see {@code docs/API_CONTRACT.md} §4).
 * Mirrors the frontend {@code RequestDraft = Omit<EquipmentRequest,
 * 'id' | 'status' | 'createdAt' | 'updatedAt' | 'history' | 'equipmentName'}>:
 * the server assigns the id, initial status, timestamps, history, and the
 * denormalized {@code equipmentName} resolved from {@code equipmentId}, and
 * {@code rejectReason} is never client-supplied.
 *
 * <p>Optional (nullable): {@code notes}.
 */
public record RequestDraft(
	String equipmentId,
	String requestingInstitutionId,
	String supplyingInstitutionId,
	int quantity,
	String purpose,
	String requestedDate,
	String requiredDate,
	String expectedReturnDate,
	String deliveryLocation,
	String notes
) {}
