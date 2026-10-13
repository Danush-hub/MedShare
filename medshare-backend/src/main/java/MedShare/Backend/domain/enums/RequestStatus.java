package MedShare.Backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RequestStatus {
	PENDING("Pending"),
	APPROVED("Approved"),
	REJECTED("Rejected"),
	CANCELLED("Cancelled"),
	DISPATCHED("Dispatched"),
	RECEIVED("Received"),
	RETURNED("Returned"),
	COMPLETED("Completed");

	private final String label;

	RequestStatus(String label) {
		this.label = label;
	}

	@JsonValue
	public String getLabel() {
		return label;
	}

	@JsonCreator
	public static RequestStatus fromLabel(String label) {
		for (RequestStatus v : values()) {
			if (v.label.equals(label)) return v;
		}
		throw new IllegalArgumentException("Unknown RequestStatus label: " + label);
	}
}
