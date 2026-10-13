package MedShare.Backend.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import MedShare.Backend.domain.UserSettings;
import MedShare.Backend.dto.SettingsPatchBody;
import MedShare.Backend.service.SettingsService;

/**
 * Workspace settings endpoints (see {@code docs/API_CONTRACT.md} §6.2-6.3).
 * {@code GET} returns the current settings; {@code PATCH} applies a partial,
 * section-merged update and returns the resulting {@code UserSettings}. Server-
 * managed fields (user role) are never overwritten and blank required names are
 * rejected with {@code 400 VALIDATION_ERROR}. No 403 checks yet — authentication
 * is explicitly out of scope for this phase.
 */
@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

	private final SettingsService settingsService;

	public SettingsController(SettingsService settingsService) {
		this.settingsService = settingsService;
	}

	@GetMapping
	public UserSettings get() {
		return settingsService.getSettings();
	}

	@PatchMapping
	public UserSettings update(@RequestBody SettingsPatchBody patch) {
		return settingsService.updateSettings(patch);
	}
}
