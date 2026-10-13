package MedShare.Backend.dto;

/**
 * Body of {@code POST /api/v1/transfers/{id}/return} (contract §5.6):
 * {@code stage} is one of the three documented return-cycle labels
 * ("Return Scheduled", "Returned", "Completed"); {@code note} is optional.
 * The stage arrives as a raw string so an unsupported value is rejected as a
 * {@code 400 VALIDATION_ERROR} with field details before the lifecycle graph
 * evaluates the transition.
 */
public record TransferReturnRequest(
	String stage,
	String note
) {}
