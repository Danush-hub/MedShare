package MedShare.Backend.dto;

import MedShare.Backend.domain.enums.EquipmentAvailability;
import MedShare.Backend.domain.enums.EquipmentCategory;
import MedShare.Backend.domain.enums.EquipmentCondition;

/**
 * Create/update payload for an equipment listing. Mirrors the frontend
 * {@code EquipmentDraft = Omit<MedicalEquipment, 'id' | 'updatedAt'>}: the
 * server assigns {@code id} and {@code updatedAt} and derives the final
 * {@code availability} label from the unit counts, so clients never supply
 * server-generated fields.
 *
 * <p>Optional (nullable) fields: {@code internalReference}, {@code description},
 * {@code maintenanceNotes}, {@code availableFrom}, {@code availableUntil}.
 */
public record EquipmentDraft(
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
	boolean documentationOnFile
) {}
