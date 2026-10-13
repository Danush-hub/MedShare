package MedShare.Backend.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import MedShare.Backend.domain.MedicalEquipment;
import MedShare.Backend.dto.EquipmentDraft;
import MedShare.Backend.service.EquipmentService;

/**
 * Equipment CRUD endpoints (see {@code docs/API_CONTRACT.md} §3). The create
 * body omits server-generated fields ({@code id}, {@code updatedAt}) and is
 * validated by the service layer; delete returns 409 when the listing is
 * referenced by open requests or active transfers.
 */
@RestController
@RequestMapping("/api/v1/equipment")
public class EquipmentController {

	private final EquipmentService equipmentService;

	public EquipmentController(EquipmentService equipmentService) {
		this.equipmentService = equipmentService;
	}

	@GetMapping
	public List<MedicalEquipment> list() {
		return equipmentService.listEquipment();
	}

	@GetMapping("/{id}")
	public MedicalEquipment get(@PathVariable String id) {
		return equipmentService.getEquipment(id);
	}

	@PostMapping
	public ResponseEntity<MedicalEquipment> create(@RequestBody EquipmentDraft draft) {
		MedicalEquipment created = equipmentService.createEquipment(draft);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@PatchMapping("/{id}")
	public MedicalEquipment update(@PathVariable String id, @RequestBody EquipmentDraft draft) {
		return equipmentService.updateEquipment(id, draft);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		equipmentService.deleteEquipment(id);
		return ResponseEntity.noContent().build();
	}
}
