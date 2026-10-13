package MedShare.Backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum InstitutionStatus {
	ACTIVE("Active"),
	PENDING_VERIFICATION("Pending Verification"),
	SUSPENDED("Suspended");

	private final String label;

	InstitutionStatus(String label) {
		this.label = label;
	}

	@JsonValue
	public String getLabel() {
		return label;
	}

	@JsonCreator
	public static InstitutionStatus fromLabel(String label) {
		for (InstitutionStatus v : values()) {
			if (v.label.equals(label)) return v;
		}
		throw new IllegalArgumentException("Unknown InstitutionStatus label: " + label);
	}
}
