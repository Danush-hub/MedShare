package MedShare.Backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import MedShare.Backend.domain.Activity;
import MedShare.Backend.domain.UserSettings;
import MedShare.Backend.domain.enums.ActivityType;
import MedShare.Backend.dto.SettingsPatchBody;
import MedShare.Backend.store.WorkspaceStore;
import MedShare.Backend.web.error.ValidationException;

/**
 * Workspace settings over the in-memory {@link WorkspaceStore}. Mirrors the
 * frontend {@code SettingsService} contract
 * ({@code src/services/contracts/settings.ts} and the mock in
 * {@code src/services/mock/directory.ts}):
 * <ul>
 *   <li>{@code PATCH} merges by section (institution / user / preferences) and
 *       field by field within a section — an absent section or field keeps its
 *       current value (contract §6.3 "any subset");</li>
 *   <li>validation matches the mock exactly: a provided {@code institution.name}
 *       or {@code user.displayName} must not be blank, surfaced as
 *       {@code 400 VALIDATION_ERROR} with the same field-detail keys;</li>
 *   <li>{@code user.role} is server-managed and never overwritten (the frontend
 *       renders it read-only); passwords are not part of this resource;</li>
 *   <li>every successful update appends the {@code settings_updated} activity
 *       entry that the frontend {@code settings/update} reducer produces.</li>
 * </ul>
 * Like the other mutating services, updates are {@code synchronized} so the
 * settings write and the activity append land atomically.
 */
@Service
public class SettingsService {

	private final WorkspaceStore store;

	public SettingsService(WorkspaceStore store) {
		this.store = store;
	}

	public UserSettings getSettings() {
		return store.getSettings();
	}

	public synchronized UserSettings updateSettings(SettingsPatchBody patch) {
		UserSettings existing = store.getSettings();
		SettingsPatchBody.InstitutionPatch institution = patch.institutionOrEmpty();
		SettingsPatchBody.UserPatch user = patch.userOrEmpty();
		SettingsPatchBody.PreferencesPatch preferences = patch.preferencesOrEmpty();

		// Validation mirrors createMockSettingsService: only provided values are
		// checked; omitting a field keeps the stored (valid) value.
		Map<String, List<String>> details = new LinkedHashMap<>();
		if (institution.name() != null && institution.name().isBlank()) {
			details.put("institution.name", List.of("Institution name is required."));
		}
		if (user.displayName() != null && user.displayName().isBlank()) {
			details.put("user.displayName", List.of("Display name is required."));
		}
		if (!details.isEmpty()) {
			throw new ValidationException("Please fix the highlighted fields before saving.", details);
		}

		UserSettings.InstitutionSettings currentInstitution = existing.institution();
		UserSettings.UserDisplaySettings currentUser = existing.user();
		UserSettings.NotificationPreferences currentPreferences = existing.preferences();

		UserSettings updated = new UserSettings(
			new UserSettings.InstitutionSettings(
				pick(institution.name(), currentInstitution.name()),
				institution.type() != null ? institution.type() : currentInstitution.type(),
				pick(institution.city(), currentInstitution.city()),
				pick(institution.contactPerson(), currentInstitution.contactPerson()),
				pick(institution.workEmail(), currentInstitution.workEmail())),
			new UserSettings.UserDisplaySettings(
				pick(user.displayName(), currentUser.displayName()),
				pick(user.username(), currentUser.username()),
				// role is server-managed: any client-sent value is ignored.
				currentUser.role()),
			new UserSettings.NotificationPreferences(
				pick(preferences.emailOnNewRequest(), currentPreferences.emailOnNewRequest()),
				pick(preferences.emailOnRequestDecision(), currentPreferences.emailOnRequestDecision()),
				pick(preferences.emailOnTransferUpdate(), currentPreferences.emailOnTransferUpdate()),
				pick(preferences.weeklyDigest(), currentPreferences.weeklyDigest())));
		store.setSettings(updated);

		// Mirrors the frontend settings/update reducer activity entry.
		store.addActivity(new Activity(store.nextActivityId(), ActivityType.SETTINGS_UPDATED,
			"Updated workspace settings.", "SETTINGS", null, nowIso()));
		return updated;
	}

	// --- helpers -------------------------------------------------------------

	/** Partial-merge primitive: a null patch value keeps the stored value. */
	private static String pick(String candidate, String current) {
		return candidate != null ? candidate : current;
	}

	private static boolean pick(Boolean candidate, boolean current) {
		return candidate != null ? candidate : current;
	}

	private static String nowIso() {
		// ISO-8601 UTC with Z suffix, second precision (matches contract timestamps).
		return Instant.now().truncatedTo(ChronoUnit.SECONDS).toString();
	}
}
