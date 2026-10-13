package MedShare.Backend.domain;

import MedShare.Backend.domain.enums.ActivityType;

/**
 * A chronological record of an important workflow action.
 * Optional fields (nullable): relatedId, status.
 */
public record Activity(
	String id,
	ActivityType type,
	String description,
	String relatedId,
	String status,
	String at
) {}
