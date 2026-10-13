package MedShare.Backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TransferStatus {
	AWAITING_DISPATCH("Awaiting Dispatch"),
	DISPATCHED("Dispatched"),
	IN_TRANSIT("In Transit"),
	RECEIVED("Received"),
	RETURN_SCHEDULED("Return Scheduled"),
	RETURNED("Returned"),
	COMPLETED("Completed");

	private final String label;

	TransferStatus(String label) {
		this.label = label;
	}

	@JsonValue
	public String getLabel() {
		return label;
	}

	@JsonCreator
	public static TransferStatus fromLabel(String label) {
		for (TransferStatus v : values()) {
			if (v.label.equals(label)) return v;
		}
		throw new IllegalArgumentException("Unknown TransferStatus label: " + label);
	}
}
