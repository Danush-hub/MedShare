package MedShare.Backend.dto;

/**
 * Body of {@code POST /api/v1/transfers} (see {@code docs/API_CONTRACT.md} §5.3):
 * a transfer is prepared solely from an existing approved request, so the only
 * writable field is the reference to it. All other transfer fields are derived
 * server-side from the request.
 */
public record TransferCreateRequest(
	String requestId
) {}
