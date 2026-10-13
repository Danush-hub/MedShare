package MedShare.Backend.web.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Translates controller/service exceptions into the single {@link ApiError}
 * envelope defined in {@code docs/API_CONTRACT.md} §0.2, mapping each condition
 * to its contract HTTP status. Unexpected failures collapse to a generic
 * {@code 500 INTERNAL_ERROR} so no stack trace ever leaks to the client.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ApiError> handleApiException(ApiException ex) {
		ApiError body = ex.details() != null
			? ApiError.withDetails(ex.code(), ex.getMessage(), ex.details())
			: ApiError.of(ex.code(), ex.getMessage());
		return ResponseEntity.status(ex.status()).body(body);
	}

	/** Malformed JSON or an unknown enum label in a request body → 400. */
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
		ApiError body = ApiError.of(ApiErrorCode.VALIDATION_ERROR,
			"Request body is missing or invalid.");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
		ApiError body = ApiError.of(ApiErrorCode.INTERNAL_ERROR,
			"Something went wrong while processing this request.");
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}
}
