package MedShare.Backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EquipmentCategory {
	PATIENT_MONITORING("Patient Monitoring"),
	RESPIRATORY_SUPPORT("Respiratory Support"),
	DIAGNOSTIC_EQUIPMENT("Diagnostic Equipment"),
	EMERGENCY_EQUIPMENT("Emergency Equipment"),
	MOBILITY_AND_PATIENT_CARE("Mobility & Patient Care"),
	SURGICAL_SUPPORT("Surgical Support");

	private final String label;

	EquipmentCategory(String label) {
		this.label = label;
	}

	@JsonValue
	public String getLabel() {
		return label;
	}

	@JsonCreator
	public static EquipmentCategory fromLabel(String label) {
		for (EquipmentCategory v : values()) {
			if (v.label.equals(label)) return v;
		}
		throw new IllegalArgumentException("Unknown EquipmentCategory label: " + label);
	}
}
