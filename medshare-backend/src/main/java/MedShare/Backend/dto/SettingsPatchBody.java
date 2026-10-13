package MedShare.Backend.dto;

import MedShare.Backend.domain.enums.InstitutionType;

/**
 * Body of {@code PATCH /api/v1/settings} (contract §6.3): any subset of the
 * {@code UserSettings} sections, merged section by section into the stored
 * settings. Every field is nullable — an absent field keeps its current value
 * (partial-update semantics) — except {@code user.role}, which is server-managed
 * and always ignored (the frontend renders it read-only).
 *
 * <p>{@code preferences} uses boxed booleans so {@code null} means "omit"
 * rather than the primitive default {@code false}.</p>
 */
public record SettingsPatchBody(
	InstitutionPatch institution,
	UserPatch user,
	PreferencesPatch preferences
) {

	public record InstitutionPatch(
		String name,
		InstitutionType type,
		String city,
		String contactPerson,
		String workEmail
	) {}

	public record UserPatch(
		String displayName,
		String username,
		String role
	) {}

	public record PreferencesPatch(
		Boolean emailOnNewRequest,
		Boolean emailOnRequestDecision,
		Boolean emailOnTransferUpdate,
		Boolean weeklyDigest
	) {}

	/** Convenience accessors that never return null; absent sections merge as no-ops. */
	public InstitutionPatch institutionOrEmpty() {
		return institution != null ? institution : new InstitutionPatch(null, null, null, null, null);
	}

	public UserPatch userOrEmpty() {
		return user != null ? user : new UserPatch(null, null, null);
	}

	public PreferencesPatch preferencesOrEmpty() {
		return preferences != null ? preferences : new PreferencesPatch(null, null, null, null);
	}
}
