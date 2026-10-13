package MedShare.Backend.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import MedShare.Backend.domain.User;
import MedShare.Backend.dto.LoginRequest;
import MedShare.Backend.service.AuthService;
import MedShare.Backend.web.error.UnauthorizedException;

/**
 * Demo authentication endpoints (see {@code docs/API_CONTRACT.md} §1).
 *
 * <ul>
 *   <li>{@code POST /login} validates the fixed demo credentials and returns the
 *   {@link User}; bad credentials are {@code 401 UNAUTHORIZED} with a single
 *   generic message (never says which field was wrong).</li>
 *   <li>{@code POST /logout} returns {@code 204} per the contract. It is a
 *   no-op server-side because there is no session to invalidate — the frontend
 *   clears its own {@code sessionStorage}.</li>
 *   <li>{@code GET /me} always returns {@code 401 UNAUTHORIZED}.</li>
 * </ul>
 *
 * <p><b>Why {@code /me} cannot return a user:</b> no token is issued by
 * {@code /login} and the frontend keeps its session entirely client-side,
 * sending no {@code Authorization} header. A stateless server therefore has no
 * way to identify who is calling, and returning a user would falsely imply a
 * server-validated session. Reporting "not signed in" ({@code 401}) is the
 * honest match for the frontend's own synchronous {@code getCurrentUser() →
 * null} in API mode. Enabling a real {@code /me} requires a token/session
 * strategy plus a matching frontend change, which is deliberately out of scope
 * here.</p>
 *
 * <p>These endpoints do <b>not</b> secure the other API routes: every existing
 * endpoint remains public.</p>
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<User> login(@RequestBody(required = false) LoginRequest body) {
		String username = body == null ? null : body.username();
		String password = body == null ? null : body.password();
		return ResponseEntity.ok(authService.login(username, password));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout() {
		// Nothing to invalidate server-side; the client clears its own session.
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/me")
	public ResponseEntity<User> me() {
		// No session token exists to validate the caller — never authenticated.
		throw new UnauthorizedException("No active session. Please sign in again.");
	}
}
