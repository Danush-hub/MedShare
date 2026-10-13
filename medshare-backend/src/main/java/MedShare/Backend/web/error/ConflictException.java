package MedShare.Backend.web.error;

import org.springframework.http.HttpStatus;

/** State conflict (e.g. blocked deletion) — maps to {@code 409 CONFLICT}. */
public class ConflictException extends ApiException {

	public ConflictException(String message) {
		super(HttpStatus.CONFLICT, ApiErrorCode.CONFLICT, message, null);
	}
}
