package MedShare.Backend.web.error;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Standard API error envelope (see {@code docs/API_CONTRACT.md} §0.2).
 * {@code details} carries optional field-level validation messages keyed by
 * field name; it is omitted from the JSON when absent.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
	ApiErrorCode code,
	String message,
	Map<String, List<String>> details
) {
	public static ApiError of(ApiErrorCode code, String message) {
		return new ApiError(code, message, null);
	}

	public static ApiError withDetails(ApiErrorCode code, String message, Map<String, List<String>> details) {
		return new ApiError(code, message, details);
	}
}
