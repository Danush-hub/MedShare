package MedShare.Backend.domain;

/**
 * A timestamped status change recorded on a request or transfer.
 * The status field stores the enum label string (e.g. "Pending", "Dispatched").
 * note is optional (nullable).
 */
public record StatusEvent(
	String status,
	String at,
	String note
) {}
