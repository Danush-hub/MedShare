package MedShare.Backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import MedShare.Backend.domain.Hospital;
import MedShare.Backend.store.WorkspaceStore;
import MedShare.Backend.web.error.NotFoundException;

/**
 * Read-only hospital (institution) directory. Backed entirely by the in-memory
 * {@link WorkspaceStore}; satisfies the frontend {@code HospitalService}
 * contract (list + get, throwing NOT_FOUND for a missing record).
 */
@Service
public class HospitalService {

	private final WorkspaceStore store;

	public HospitalService(WorkspaceStore store) {
		this.store = store;
	}

	public List<Hospital> listHospitals() {
		return store.getHospitals();
	}

	public Hospital getHospital(String id) {
		return store.getHospitalById(id)
			.orElseThrow(() -> new NotFoundException("Institution " + id + " was not found."));
	}
}
