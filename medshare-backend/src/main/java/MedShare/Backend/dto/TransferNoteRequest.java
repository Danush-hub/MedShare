package MedShare.Backend.dto;

/**
 * Optional body of {@code POST /api/v1/transfers/{id}/dispatch} and
 * {@code /receive} (contract §5.4-5.5: "optional { note }"). A blank or absent
 * note keeps the default "Marked {status}." timeline entry produced by the
 * frontend reducer.
 */
public record TransferNoteRequest(
	String note
) {}
