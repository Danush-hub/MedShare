package MedShare.Backend.web.error;

import org.springframework.http.HttpStatus;

/** Resource does not exist — maps to {@code 404 NOT_FOUND}. */
public class NotFoundException extends ApiException {

	public NotFoundException(String message) {
		super(HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND, message, null);
	}
}
