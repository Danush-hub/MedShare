package MedShare.Backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum InstitutionType {
	HOSPITAL("Hospital"),
	CLINIC("Clinic"),
	MEDICAL_CENTER("Medical Center"),
	COMMUNITY_HEALTH_CENTER("Community Health Center");

	private final String label;

	InstitutionType(String label) {
		this.label = label;
	}

	@JsonValue
	public String getLabel() {
		return label;
	}

	@JsonCreator
	public static InstitutionType fromLabel(String label) {
		for (InstitutionType v : values()) {
			if (v.label.equals(label)) return v;
		}
		throw new IllegalArgumentException("Unknown InstitutionType label: " + label);
	}
}
