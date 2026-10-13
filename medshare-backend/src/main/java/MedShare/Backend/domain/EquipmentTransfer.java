package MedShare.Backend.domain;

import java.util.List;

import MedShare.Backend.domain.enums.TransferStatus;

/**
 * Physical movement of an approved request between institutions.
 * Optional fields (nullable): dispatchDate, expectedReturn, handoverNotes.
 */
public record EquipmentTransfer(
	String id,
	String requestId,
	String equipmentId,
	String equipmentName,
	String sendingInstitutionId,
	String receivingInstitutionId,
	int quantity,
	String dispatchDate,
	String expectedReturn,
	String handoverNotes,
	TransferStatus status,
	String createdAt,
	String updatedAt,
	List<StatusEvent> timeline
) {
	public EquipmentTransfer {
		timeline = List.copyOf(timeline);
	}
}
