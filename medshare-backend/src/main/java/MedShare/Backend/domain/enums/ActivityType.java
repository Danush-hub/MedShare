package MedShare.Backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ActivityType {
	EQUIPMENT_CREATED("equipment_created"),
	EQUIPMENT_UPDATED("equipment_updated"),
	EQUIPMENT_DELETED("equipment_deleted"),
	REQUEST_SUBMITTED("request_submitted"),
	REQUEST_APPROVED("request_approved"),
	REQUEST_REJECTED("request_rejected"),
	REQUEST_CANCELLED("request_cancelled"),
	TRANSFER_CREATED("transfer_created"),
	TRANSFER_UPDATED("transfer_updated"),
	SETTINGS_UPDATED("settings_updated");

	private final String label;

	ActivityType(String label) {
		this.label = label;
	}

	@JsonValue
	public String getLabel() {
		return label;
	}

	@JsonCreator
	public static ActivityType fromLabel(String label) {
		for (ActivityType v : values()) {
			if (v.label.equals(label)) return v;
		}
		throw new IllegalArgumentException("Unknown ActivityType label: " + label);
	}
}
