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

import MedShare.Backend.domain.EquipmentRequest;
import MedShare.Backend.dto.ApproveRequestBody;
import MedShare.Backend.dto.RejectRequestBody;
import MedShare.Backend.dto.RequestDraft;
import MedShare.Backend.service.RequestService;

/**
 * Equipment request endpoints (see {@code docs/API_CONTRACT.md} §4). The list
 * returns a plain JSON array, matching the frontend {@code RequestService}
 * contract and the Phase 2 convention (the contract's pagination envelope is
 * not implemented anywhere yet). Create takes the draft body and returns 201
 * with server-assigned id/status/timestamps/history; approve, reject and cancel
 * are Pending-only transitions surfaced as 409 CONFLICT. No 403 ownership
 * checks yet — authentication is explicitly out of scope for this phase.
 */
@RestController
@RequestMapping("/api/v1/requests")
public class RequestController {

	private final RequestService requestService;

	public RequestController(RequestService requestService) {
		this.requestService = requestService;
	}

	@GetMapping
	public List<EquipmentRequest> list() {
		return requestService.listRequests();
	}

	@GetMapping("/{id}")
	public EquipmentRequest get(@PathVariable String id) {
		return requestService.getRequest(id);
	}

	@PostMapping
	public ResponseEntity<EquipmentRequest> create(@RequestBody RequestDraft draft) {
		return ResponseEntity.status(HttpStatus.CREATED).body(requestService.createRequest(draft));
	}

	@PostMapping("/{id}/approve")
	public EquipmentRequest approve(
		@PathVariable String id,
		@RequestBody(required = false) ApproveRequestBody body) {
		return requestService.approveRequest(id, body == null ? null : body.note());
	}

	@PostMapping("/{id}/reject")
	public EquipmentRequest reject(@PathVariable String id, @RequestBody RejectRequestBody body) {
		return requestService.rejectRequest(id, body.reason());
	}

	@PostMapping("/{id}/cancel")
	public EquipmentRequest cancel(@PathVariable String id) {
		return requestService.cancelRequest(id);
	}
}
