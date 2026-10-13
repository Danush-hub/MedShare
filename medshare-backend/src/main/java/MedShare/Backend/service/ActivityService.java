package MedShare.Backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import MedShare.Backend.domain.Activity;
import MedShare.Backend.store.WorkspaceStore;

/**
 * Read-only activity history over the in-memory {@link WorkspaceStore}. Mirrors
 * the frontend {@code ActivityService} contract
 * ({@code src/services/contracts/activity.ts}): newest-first entries for the
 * current workspace, produced exclusively as side effects of the
 * equipment / request / transfer / settings services — clients never write to
 * the log directly. Seed entries and mutation-generated entries are returned
 * as-is ({@code WorkspaceStore.addActivity} prepends, keeping the list
 * newest-first).
 */
@Service
public class ActivityService {

	private final WorkspaceStore store;

	public ActivityService(WorkspaceStore store) {
		this.store = store;
	}

	public List<Activity> listActivities() {
		return store.getActivities();
	}
}
