package MedShare.Backend.dto;

import MedShare.Backend.domain.enums.TransferStatus;

/**
 * Body of {@code POST /api/v1/transfers/{id}/status}, the compatibility
 * endpoint for the frontend's generic
 * {@code updateTransferStatus(id, status, note?)} contract
 * ({@code src/services/contracts/transfers.ts}). {@code status} is a
 * {@code TransferStatus} label (e.g. {@code "Dispatched"}, {@code "In Transit"},
 * {@code "Received"}, {@code "Return Scheduled"}, {@code "Returned"},
 * {@code "Completed"}); an unknown label is rejected with {@code 400
 * VALIDATION_ERROR} by the shared body-parse handler. The controller routes the
 * value through the same validated lifecycle transition as the dedicated
 * {@code /dispatch}, {@code /receive} and {@code /return} action routes.
 * {@code note} is optional.
 */
public record TransferStatusUpdateRequest(
	TransferStatus status,
	String note
) {}
