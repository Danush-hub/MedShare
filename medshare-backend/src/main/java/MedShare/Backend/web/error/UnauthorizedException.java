package MedShare.Backend.web.error;

import org.springframework.http.HttpStatus;

/**
 * Missing or invalid credentials — maps to {@code 401 UNAUTHORIZED} per
 * {@code docs/API_CONTRACT.md} §0.2/§1. The message is intentionally generic so
 * it never reveals whether the username or the password was the wrong field.
 */
public class UnauthorizedException extends ApiException {

	public UnauthorizedException(String message) {
		super(HttpStatus.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED, message, null);
	}
}
