package MedShare.Backend.dto;

import java.util.List;

import MedShare.Backend.domain.enums.TransferStatus;

/**
 * Response of {@code GET /api/v1/transfers/{id}/transition-options}, mirroring
 * the frontend {@code TransferTransitionOptions} contract
 * ({@code src/services/contracts/transfers.ts}): the next statuses the acting
 * institution may record now ({@code available}) versus those owned by the
 * counterpart ({@code counterpartOwned}). Serialized {@code TransferStatus}
 * values use their display labels, matching the frontend {@code TransferStatus}
 * union.
 */
public record TransferTransitionOptionsDto(
	List<TransferStatus> available,
	List<TransferStatus> counterpartOwned
) {
	public TransferTransitionOptionsDto {
		// Defensive copy so the returned options cannot mutate cached state.
		available = available == null ? List.of() : List.copyOf(available);
		counterpartOwned = counterpartOwned == null ? List.of() : List.copyOf(counterpartOwned);
	}
}
