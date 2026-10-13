package MedShare.Backend.service;

import org.springframework.stereotype.Service;

import MedShare.Backend.domain.User;
import MedShare.Backend.domain.enums.UserRole;
import MedShare.Backend.web.error.UnauthorizedException;

/**
 * Minimal in-memory demo authentication, mirroring the frontend mock
 * ({@code src/services/mock/auth.ts}) exactly so the UI's {@code AuthService}
 * contract is satisfied without a real credential store or session mechanism.
 *
 * <p><b>This is a demonstration only and grants no security.</b> The single
 * demo identity below is the same hardcoded constant the mock already ships to
 * the browser; it is not a secret and protects nothing. No token is issued and
 * no session is tracked: the frontend keeps its "session" entirely client-side
 * in {@code sessionStorage} and sends no {@code Authorization} header, so the
 * other API endpoints remain unauthenticated exactly as before.</p>
 */
@Service
public class AuthService {

	/** Demo credentials — identical to the mock's {@code DEMO_CREDENTIALS}. */
	private static final String DEMO_USERNAME = "admin";
	private static final String DEMO_PASSWORD = "1234";

	/** The single user surfaced on a successful login, matching {@code DEMO_USER}. */
	private static final User DEMO_USER = new User(
		"usr-demo-admin",
		"admin",
		"MedShare Administrator",
		UserRole.ADMIN,
		// The mock DEMO_USER carries no email/institutionId; kept null to match.
		null,
		null);

	/** Generic failure message — never reveals which field was wrong. */
	private static final String INVALID_CREDENTIALS =
		"Invalid username or password. Please try again.";

	/**
	 * Validates credentials with the same semantics as the mock: the username is
	 * trimmed before comparison, the password is compared verbatim. A null field
	 * simply fails rather than throwing.
	 */
	public User login(String username, String password) {
		boolean matches = username != null
			&& password != null
			&& username.trim().equals(DEMO_USERNAME)
			&& password.equals(DEMO_PASSWORD);
		if (!matches) {
			throw new UnauthorizedException(INVALID_CREDENTIALS);
		}
		return DEMO_USER;
	}
}
