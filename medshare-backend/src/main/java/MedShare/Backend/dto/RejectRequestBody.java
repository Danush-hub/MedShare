package MedShare.Backend.dto;

/**
 * Body of {@code POST /api/v1/requests/{id}/reject} (contract §4.5): a
 * required, non-blank reason the supplying institution declines the request.
 */
public record RejectRequestBody(
	String reason
) {}
