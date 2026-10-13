package MedShare.Backend.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import MedShare.Backend.domain.EquipmentTransfer;
import MedShare.Backend.dto.TransferCreateRequest;
import MedShare.Backend.dto.TransferNoteRequest;
import MedShare.Backend.dto.TransferReturnRequest;
import MedShare.Backend.dto.TransferStatusUpdateRequest;
import MedShare.Backend.dto.TransferTransitionOptionsDto;
import MedShare.Backend.service.TransferService;

/**
 * Equipment transfer endpoints (see {@code docs/API_CONTRACT.md} §5). The list
 * returns a plain JSON array, matching the frontend {@code TransferService}
 * contract and the Phase 2/3 convention. Note the shape difference between the
 * contract (dedicated {@code /dispatch}, {@code /receive}, {@code /return}
 * action routes) and the frontend service (one generic
 * {@code updateTransferStatus(id, status, note)}); the documented action routes
 * are implemented here, and each delegates to the same validated lifecycle
 * transition. No 403 sender/receiver actor checks yet — authentication is out
 * of scope for this phase.
 */
@RestController
@RequestMapping("/api/v1/transfers")
public class TransferController {

	private final TransferService transferService;

	public TransferController(TransferService transferService) {
		this.transferService = transferService;
	}

	@GetMapping
	public List<EquipmentTransfer> list() {
		return transferService.listTransfers();
	}

	@GetMapping("/{id}")
	public EquipmentTransfer get(@PathVariable String id) {
		return transferService.getTransfer(id);
	}

	@PostMapping
	public ResponseEntity<EquipmentTransfer> create(@RequestBody TransferCreateRequest body) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(transferService.createTransfer(body.requestId()));
	}

	@PostMapping("/{id}/dispatch")
	public EquipmentTransfer dispatch(
		@PathVariable String id,
		@RequestBody(required = false) TransferNoteRequest body) {
		return transferService.dispatch(id, body == null ? null : body.note());
	}

	@PostMapping("/{id}/receive")
	public EquipmentTransfer receive(
		@PathVariable String id,
		@RequestBody(required = false) TransferNoteRequest body) {
		return transferService.receive(id, body == null ? null : body.note());
	}

	@PostMapping("/{id}/return")
	public EquipmentTransfer returnStage(@PathVariable String id, @RequestBody TransferReturnRequest body) {
		return transferService.recordReturnStage(id, body.stage(), body.note());
	}

	/**
	 * Compatibility route for the frontend's generic
	 * {@code updateTransferStatus(id, status, note?)}. Delegates to the same
	 * validated lifecycle transition as {@code /dispatch}, {@code /receive} and
	 * {@code /return}; additionally makes the legal {@code In Transit} step
	 * reachable, which the dedicated action routes never exposed. Existing routes
	 * are untouched.
	 */
	@PostMapping("/{id}/status")
	public EquipmentTransfer updateStatus(
		@PathVariable String id,
		@RequestBody TransferStatusUpdateRequest body) {
		return transferService.updateStatus(id, body.status(), body.note());
	}

	/**
	 * Valid next transitions for the acting institution, split into
	 * {@code available} and {@code counterpartOwned} — the backend source for the
	 * frontend {@code getTransitionOptions(id)} contract.
	 */
	@GetMapping("/{id}/transition-options")
	public TransferTransitionOptionsDto transitionOptions(@PathVariable String id) {
		return transferService.getTransitionOptions(id);
	}
}
