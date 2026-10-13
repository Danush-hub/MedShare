package MedShare.Backend.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import MedShare.Backend.domain.Hospital;
import MedShare.Backend.service.HospitalService;

/**
 * Read-only hospital directory endpoints (see {@code docs/API_CONTRACT.md} §2).
 * Only {@code GET} operations are exposed in this phase; create/update are not
 * implemented per the phase scope.
 */
@RestController
@RequestMapping("/api/v1/hospitals")
public class HospitalController {

	private final HospitalService hospitalService;

	public HospitalController(HospitalService hospitalService) {
		this.hospitalService = hospitalService;
	}

	@GetMapping
	public List<Hospital> list() {
		return hospitalService.listHospitals();
	}

	@GetMapping("/{id}")
	public Hospital get(@PathVariable String id) {
		return hospitalService.getHospital(id);
	}
}
