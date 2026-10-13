package MedShare.Backend.domain;

import MedShare.Backend.domain.enums.EquipmentAvailability;
import MedShare.Backend.domain.enums.EquipmentCategory;
import MedShare.Backend.domain.enums.EquipmentCondition;

/**
 * A listed, shareable equipment line owned by an institution.
 * Optional fields (nullable): internalReference, description,
 * maintenanceNotes, availableFrom, availableUntil.
 */
public record MedicalEquipment(
	String id,
	String name,
	EquipmentCategory category,
	String institutionId,
	String internalReference,
	int quantity,
	int availableQuantity,
	String city,
	EquipmentCondition condition,
	EquipmentAvailability availability,
	String description,
	String maintenanceNotes,
	String availableFrom,
	String availableUntil,
	boolean documentationOnFile,
	String updatedAt
) {}
