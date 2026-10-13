package MedShare.Backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EquipmentAvailability {
	AVAILABLE("Available"),
	PARTIALLY_AVAILABLE("Partially Available"),
	RESERVED("Reserved"),
	UNAVAILABLE("Unavailable"),
	UNDER_MAINTENANCE("Under Maintenance"),
	RETIRED("Retired");

	private final String label;

	EquipmentAvailability(String label) {
		this.label = label;
	}

	@JsonValue
	public String getLabel() {
		return label;
	}

	@JsonCreator
	public static EquipmentAvailability fromLabel(String label) {
		for (EquipmentAvailability v : values()) {
			if (v.label.equals(label)) return v;
		}
		throw new IllegalArgumentException("Unknown EquipmentAvailability label: " + label);
	}
}
