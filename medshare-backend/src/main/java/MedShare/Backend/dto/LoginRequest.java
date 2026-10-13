package MedShare.Backend.dto;

/**
 * Body of {@code POST /api/v1/auth/login} (contract §1.1):
 * {@code { "username": "...", "password": "..." }}. The password is used only
 * for the immediate comparison and is never stored or echoed back.
 */
public record LoginRequest(
	String username,
	String password
) {}
