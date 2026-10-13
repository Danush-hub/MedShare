package MedShare.Backend.dto;

/**
 * Optional body of {@code POST /api/v1/requests/{id}/approve} (contract §4.4:
 * "none (optional { note })"). A blank or absent note keeps the standard
 * approval history entry produced by the frontend reducer.
 */
public record ApproveRequestBody(
	String note
) {}
