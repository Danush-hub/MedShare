package MedShare.Backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EquipmentCondition {
	EXCELLENT("Excellent"),
	GOOD("Good"),
	MAINTENANCE_REQUIRED("Maintenance Required");

	private final String label;

	EquipmentCondition(String label) {
		this.label = label;
	}

	@JsonValue
	public String getLabel() {
		return label;
	}

	@JsonCreator
	public static EquipmentCondition fromLabel(String label) {
		for (EquipmentCondition v : values()) {
			if (v.label.equals(label)) return v;
		}
		throw new IllegalArgumentException("Unknown EquipmentCondition label: " + label);
	}
}
