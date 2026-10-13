package MedShare.Backend.domain;

import MedShare.Backend.domain.enums.InstitutionType;

/**
 * Institution, account and notification settings for the workspace.
 */
public record UserSettings(
	InstitutionSettings institution,
	UserDisplaySettings user,
	NotificationPreferences preferences
) {

	public record InstitutionSettings(
		String name,
		InstitutionType type,
		String city,
		String contactPerson,
		String workEmail
	) {}

	public record UserDisplaySettings(
		String displayName,
		String username,
		String role
	) {}

	public record NotificationPreferences(
		boolean emailOnNewRequest,
		boolean emailOnRequestDecision,
		boolean emailOnTransferUpdate,
		boolean weeklyDigest
	) {}
}
