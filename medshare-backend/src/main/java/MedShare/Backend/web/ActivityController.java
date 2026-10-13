package MedShare.Backend.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import MedShare.Backend.domain.Activity;
import MedShare.Backend.service.ActivityService;

/**
 * Activity history endpoint (see {@code docs/API_CONTRACT.md} §6.1). Read-only:
 * entries are produced as side effects of the equipment / request / transfer /
 * settings services, never written directly by clients. Returns a newest-first
 * plain JSON array, matching the frontend {@code ActivityService} contract and
 * the Phase 2 convention (the contract's pagination envelope is not implemented
 * anywhere yet).
 */
@RestController
@RequestMapping("/api/v1/activities")
public class ActivityController {

	private final ActivityService activityService;

	public ActivityController(ActivityService activityService) {
		this.activityService = activityService;
	}

	@GetMapping
	public List<Activity> list() {
		return activityService.listActivities();
	}
}
