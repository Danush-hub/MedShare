package MedShare.Backend.web.error;

/**
 * Machine-readable application error codes for the {@link ApiError} envelope.
 * Mirrors the codes defined in {@code docs/API_CONTRACT.md} §0.2 and the
 * frontend {@code ApiErrorCode} union in {@code src/types/api.ts}.
 */
public enum ApiErrorCode {
	VALIDATION_ERROR,
	UNAUTHORIZED,
	NOT_FOUND,
	CONFLICT,
	INTERNAL_ERROR
}
