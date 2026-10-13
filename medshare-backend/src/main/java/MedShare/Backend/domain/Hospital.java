package MedShare.Backend.domain;

import MedShare.Backend.domain.enums.InstitutionStatus;
import MedShare.Backend.domain.enums.InstitutionType;

public record Hospital(
	String id,
	String name,
	InstitutionType type,
	String city,
	String region,
	String contactPerson,
	String contactEmail,
	String contactPhone,
	InstitutionStatus status,
	String joinedAt
) {}
