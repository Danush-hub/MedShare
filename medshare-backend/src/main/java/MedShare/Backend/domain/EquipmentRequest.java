package MedShare.Backend.domain;

import java.util.List;

import MedShare.Backend.domain.enums.RequestStatus;

/**
 * A borrow request between two institutions.
 * Optional fields (nullable): notes, rejectReason.
 */
public record EquipmentRequest(
	String id,
	String equipmentId,
	String equipmentName,
	String requestingInstitutionId,
	String supplyingInstitutionId,
	int quantity,
	String purpose,
	String requestedDate,
	String requiredDate,
	String expectedReturnDate,
	String deliveryLocation,
	String notes,
	RequestStatus status,
	String rejectReason,
	String createdAt,
	String updatedAt,
	List<StatusEvent> history
) {
	public EquipmentRequest {
		history = List.copyOf(history);
	}
}
