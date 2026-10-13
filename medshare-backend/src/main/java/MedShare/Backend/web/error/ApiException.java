package MedShare.Backend.web.error;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;

/**
 * Base class for the controlled error conditions surfaced by the MedShare API.
 * Carries the HTTP status, the contract {@link ApiErrorCode}, an optional
 * field-level {@code details} map, and a user-safe message (never a stack trace).
 */
public abstract class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final ApiErrorCode code;
	private final Map<String, List<String>> details;

	protected ApiException(HttpStatus status, ApiErrorCode code, String message, Map<String, List<String>> details) {
		super(message);
		this.status = status;
		this.code = code;
		this.details = details;
	}

	public HttpStatus status() {
		return status;
	}

	public ApiErrorCode code() {
		return code;
	}

	public Map<String, List<String>> details() {
		return details;
	}
}
