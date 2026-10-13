package MedShare.Backend.domain;

import MedShare.Backend.domain.enums.UserRole;

/**
 * A person operating MedShare.
 * Optional fields (nullable): email, institutionId.
 */
public record User(
	String id,
	String username,
	String displayName,
	UserRole role,
	String email,
	String institutionId
) {}
