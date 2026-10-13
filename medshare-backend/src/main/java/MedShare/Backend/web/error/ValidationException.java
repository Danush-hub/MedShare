package MedShare.Backend.web.error;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;

/** Request body failed validation — maps to {@code 400 VALIDATION_ERROR} with field details. */
public class ValidationException extends ApiException {

	public ValidationException(String message, Map<String, List<String>> details) {
		super(HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, message, details);
	}
}
