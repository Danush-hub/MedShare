import type { Hospital } from '@/types';

/**
 * Hospital (institution) directory contract. The prototype renders the
 * network read-only; create/update endpoints are proposed in
 * docs/API_CONTRACT.md but have no UI or service implementation yet.
 */
export interface HospitalService {
  listHospitals: () => Promise<Hospital[]>;
  /** Resolves the hospital or throws NOT_FOUND. */
  getHospital: (id: string) => Promise<Hospital>;
}
