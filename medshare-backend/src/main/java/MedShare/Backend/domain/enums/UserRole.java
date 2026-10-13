package MedShare.Backend.domain.enums;

public enum UserRole {
	ADMIN("ADMIN"),
	COORDINATOR("COORDINATOR"),
	CLINICIAN("CLINICIAN"),
	LOGISTICS("LOGISTICS");

	private final String label;

	UserRole(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}

	public static UserRole fromLabel(String label) {
		for (UserRole v : values()) {
			if (v.label.equals(label)) return v;
		}
		throw new IllegalArgumentException("Unknown UserRole label: " + label);
	}
}
