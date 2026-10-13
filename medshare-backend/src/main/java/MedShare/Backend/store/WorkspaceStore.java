package MedShare.Backend.store;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

import MedShare.Backend.domain.*;
import MedShare.Backend.domain.enums.*;

/**
 * In-memory workspace store for the MedShare backend prototype.
 * Holds all domain entities and provides thread-safe retrieval and mutation.
 * Seeded from the frontend's seed.ts data on construction.
 */
@Component
public class WorkspaceStore {

	private static final int YEAR = 2026;

	private final ConcurrentHashMap<String, Hospital> hospitals = new ConcurrentHashMap<>();
	private final ConcurrentHashMap<String, MedicalEquipment> equipment = new ConcurrentHashMap<>();
	private final ConcurrentHashMap<String, EquipmentRequest> requests = new ConcurrentHashMap<>();
	private final ConcurrentHashMap<String, EquipmentTransfer> transfers = new ConcurrentHashMap<>();
	private final CopyOnWriteArrayList<Activity> activities = new CopyOnWriteArrayList<>();

	private volatile UserSettings settings;
	private final String currentInstitutionId = "HSP-2026-001";

	private final AtomicInteger hospitalSeq = new AtomicInteger(0);
	private final AtomicInteger equipmentSeq = new AtomicInteger(0);
	private final AtomicInteger requestSeq = new AtomicInteger(0);
	private final AtomicInteger transferSeq = new AtomicInteger(0);
	private final AtomicInteger activitySeq = new AtomicInteger(0);

	public WorkspaceStore() {
		seed();
	}

	// --- ID generation -------------------------------------------------------

	public String nextEquipmentId() {
		return makeId("EQ", equipmentSeq.incrementAndGet());
	}

	public String nextRequestId() {
		return makeId("REQ", requestSeq.incrementAndGet());
	}

	public String nextTransferId() {
		return makeId("TRF", transferSeq.incrementAndGet());
	}

	public String nextActivityId() {
		return makeId("ACT", activitySeq.incrementAndGet());
	}

	public String nextHospitalId() {
		return makeId("HSP", hospitalSeq.incrementAndGet());
	}

	private static String makeId(String prefix, int seq) {
		return prefix + "-" + YEAR + "-" + String.format("%03d", seq);
	}

	// --- Accessors -----------------------------------------------------------

	public String getCurrentInstitutionId() {
		return currentInstitutionId;
	}

	// --- Hospitals -----------------------------------------------------------

	public List<Hospital> getHospitals() {
		return Collections.unmodifiableList(new ArrayList<>(hospitals.values()));
	}

	public Optional<Hospital> getHospitalById(String id) {
		return Optional.ofNullable(hospitals.get(id));
	}

	public void putHospital(Hospital h) {
		hospitals.put(h.id(), h);
		trackSeq(h.id(), hospitalSeq);
	}

	// --- Equipment -----------------------------------------------------------

	public List<MedicalEquipment> getEquipment() {
		return Collections.unmodifiableList(new ArrayList<>(equipment.values()));
	}

	public Optional<MedicalEquipment> getEquipmentById(String id) {
		return Optional.ofNullable(equipment.get(id));
	}

	public void putEquipment(MedicalEquipment e) {
		equipment.put(e.id(), e);
		trackSeq(e.id(), equipmentSeq);
	}

	public void removeEquipment(String id) {
		equipment.remove(id);
	}

	// --- Requests ------------------------------------------------------------

	public List<EquipmentRequest> getRequests() {
		return Collections.unmodifiableList(new ArrayList<>(requests.values()));
	}

	public Optional<EquipmentRequest> getRequestById(String id) {
		return Optional.ofNullable(requests.get(id));
	}

	public void putRequest(EquipmentRequest r) {
		requests.put(r.id(), r);
		trackSeq(r.id(), requestSeq);
	}

	// --- Transfers -----------------------------------------------------------

	public List<EquipmentTransfer> getTransfers() {
		return Collections.unmodifiableList(new ArrayList<>(transfers.values()));
	}

	public Optional<EquipmentTransfer> getTransferById(String id) {
		return Optional.ofNullable(transfers.get(id));
	}

	public void putTransfer(EquipmentTransfer t) {
		transfers.put(t.id(), t);
		trackSeq(t.id(), transferSeq);
	}

	// --- Activities ----------------------------------------------------------

	public List<Activity> getActivities() {
		return Collections.unmodifiableList(activities);
	}

	public void addActivity(Activity a) {
		activities.add(0, a);
		trackSeq(a.id(), activitySeq);
	}

	// --- Settings ------------------------------------------------------------

	public UserSettings getSettings() {
		return settings;
	}

	public void setSettings(UserSettings s) {
		this.settings = s;
	}

	// --- Seq tracker ---------------------------------------------------------

	private void trackSeq(String id, AtomicInteger counter) {
		String head = id.substring(0, id.lastIndexOf('-') + 1);
		String num = id.substring(head.length());
		try {
			int val = Integer.parseInt(num);
			counter.updateAndGet(current -> Math.max(current, val));
		} catch (NumberFormatException ignored) {
		}
	}

	// --- Seed data (from frontend seed.ts) -----------------------------------

	private void seed() {
		seedHospitals();
		seedEquipment();
		seedRequests();
		seedTransfers();
		seedActivities();
		seedSettings();
	}

	private void seedHospitals() {
		putHospital(new Hospital("HSP-2026-001", "Aurora City Hospital",
			InstitutionType.HOSPITAL, "Bengaluru", "Karnataka",
			"Dr. Meera Nair", "coordination@auroracity.example.in",
			"+91-80-5550-1001", InstitutionStatus.ACTIVE, "2025-02-11T09:00:00Z"));
		putHospital(new Hospital("HSP-2026-002", "Sunrise Multispeciality Center",
			InstitutionType.MEDICAL_CENTER, "Pune", "Maharashtra",
			"Rahul Deshpande", "share@sunrisepune.example.in",
			"+91-20-5550-1002", InstitutionStatus.ACTIVE, "2025-05-19T09:00:00Z"));
		putHospital(new Hospital("HSP-2026-003", "Riverside Community Clinic",
			InstitutionType.CLINIC, "Hyderabad", "Telangana",
			"Sana Qureshi", "ops@riversidehyd.example.in",
			"+91-40-5550-1003", InstitutionStatus.ACTIVE, "2025-07-02T09:00:00Z"));
		putHospital(new Hospital("HSP-2026-004", "Green Valley Medical Center",
			InstitutionType.MEDICAL_CENTER, "Chennai", "Tamil Nadu",
			"Karthik Raman", "network@greenvalley.example.in",
			"+91-44-5550-1004", InstitutionStatus.ACTIVE, "2025-08-23T09:00:00Z"));
		putHospital(new Hospital("HSP-2026-005", "Northwind Children's Hospital",
			InstitutionType.HOSPITAL, "Delhi", "Delhi",
			"Dr. Ananya Ghosh", "coordination@northwind.example.in",
			"+91-11-5550-1005", InstitutionStatus.PENDING_VERIFICATION, "2025-11-05T09:00:00Z"));
		putHospital(new Hospital("HSP-2026-006", "Lakeview General Hospital",
			InstitutionType.HOSPITAL, "Mumbai", "Maharashtra",
			"Vikram Shetty", "sharing@lakeviewmumbai.example.in",
			"+91-22-5550-1006", InstitutionStatus.ACTIVE, "2025-04-14T09:00:00Z"));
	}

	private void seedEquipment() {
		putEquipment(new MedicalEquipment("EQ-2026-001", "Multiparameter Patient Monitor",
			EquipmentCategory.PATIENT_MONITORING, "HSP-2026-001", null,
			12, 8, "Bengaluru", EquipmentCondition.EXCELLENT,
			EquipmentAvailability.PARTIALLY_AVAILABLE,
			"Bedside monitor tracking ECG, SpO2, NIBP and temperature.",
			"Last calibration completed January 2026.", null, null, true, "2026-01-20T08:30:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-002", "Oxygen Concentrator (5 LPM)",
			EquipmentCategory.RESPIRATORY_SUPPORT, "HSP-2026-001", null,
			10, 6, "Bengaluru", EquipmentCondition.GOOD,
			EquipmentAvailability.PARTIALLY_AVAILABLE,
			"Stationary oxygen concentrator for general ward support.",
			"Filters replaced December 2025.", null, null, true, "2026-01-18T10:15:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-003", "Folding Wheelchair",
			EquipmentCategory.MOBILITY_AND_PATIENT_CARE, "HSP-2026-001", null,
			15, 11, "Bengaluru", EquipmentCondition.GOOD,
			EquipmentAvailability.AVAILABLE,
			"Standard steel folding wheelchair with footrests.",
			null, null, null, false, "2026-01-15T09:00:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-004", "Automated External Defibrillator (AED)",
			EquipmentCategory.EMERGENCY_EQUIPMENT, "HSP-2026-001", null,
			6, 0, "Bengaluru", EquipmentCondition.EXCELLENT,
			EquipmentAvailability.RESERVED,
			"Portable biphasic AED with adult/paediatric pads.",
			"Pads and battery within expiry.", null, null, true, "2026-01-22T14:00:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-005", "Transport Ventilator",
			EquipmentCategory.RESPIRATORY_SUPPORT, "HSP-2026-002", null,
			4, 2, "Pune", EquipmentCondition.EXCELLENT,
			EquipmentAvailability.PARTIALLY_AVAILABLE,
			"Battery-capable ventilator for inter-facility transfer.",
			null, null, null, true, "2026-01-19T11:30:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-006", "Portable Ultrasound",
			EquipmentCategory.DIAGNOSTIC_EQUIPMENT, "HSP-2026-002", null,
			3, 1, "Pune", EquipmentCondition.GOOD,
			EquipmentAvailability.AVAILABLE,
			"Handheld ultrasound with linear and convex probes.",
			"Transducer check due March 2026.", "2026-02-01", "2026-03-01", true, "2026-01-21T08:45:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-007", "Manual Hospital Bed",
			EquipmentCategory.MOBILITY_AND_PATIENT_CARE, "HSP-2026-002", null,
			20, 14, "Pune", EquipmentCondition.GOOD,
			EquipmentAvailability.AVAILABLE,
			"Crank-operated care bed with side rails.",
			null, null, null, false, "2026-01-12T07:20:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-008", "Portable Suction Unit",
			EquipmentCategory.EMERGENCY_EQUIPMENT, "HSP-2026-003", null,
			5, 5, "Hyderabad", EquipmentCondition.GOOD,
			EquipmentAvailability.AVAILABLE,
			"AC/DC portable suction with reusable canister.",
			null, null, null, false, "2026-01-16T13:10:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-009", "Fetal Monitor",
			EquipmentCategory.PATIENT_MONITORING, "HSP-2026-003", null,
			4, 2, "Hyderabad", EquipmentCondition.EXCELLENT,
			EquipmentAvailability.PARTIALLY_AVAILABLE,
			"Twin-channel CTG monitor with toco transducer.",
			null, null, null, true, "2026-01-17T09:05:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-010", "CPAP Machine",
			EquipmentCategory.RESPIRATORY_SUPPORT, "HSP-2026-004", null,
			6, 6, "Chennai", EquipmentCondition.EXCELLENT,
			EquipmentAvailability.AVAILABLE,
			"Auto-adjusting CPAP with humidifier.",
			null, null, null, true, "2026-01-14T16:40:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-011", "12-Lead ECG Machine",
			EquipmentCategory.PATIENT_MONITORING, "HSP-2026-004", null,
			8, 3, "Chennai", EquipmentCondition.GOOD,
			EquipmentAvailability.PARTIALLY_AVAILABLE,
			"Resting 12-lead ECG with thermal printout.",
			null, null, null, false, "2026-01-13T10:00:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-012", "Stretcher Trolley",
			EquipmentCategory.MOBILITY_AND_PATIENT_CARE, "HSP-2026-004", null,
			9, 9, "Chennai", EquipmentCondition.GOOD,
			EquipmentAvailability.AVAILABLE,
			"Folding ambulance stretcher trolley with wheels.",
			null, null, null, false, "2026-01-11T08:00:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-013", "Autoclave Sterilizer",
			EquipmentCategory.SURGICAL_SUPPORT, "HSP-2026-005", null,
			3, 0, "Delhi", EquipmentCondition.MAINTENANCE_REQUIRED,
			EquipmentAvailability.UNDER_MAINTENANCE,
			"Desktop steam sterilizer for instrument trays.",
			"Door gasket replacement pending; not requestable until servicing completes.",
			null, null, true, "2026-01-10T12:00:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-014", "Portable Surgical Light",
			EquipmentCategory.SURGICAL_SUPPORT, "HSP-2026-005", null,
			5, 4, "Delhi", EquipmentCondition.EXCELLENT,
			EquipmentAvailability.AVAILABLE,
			"LED portable OT light on wheeled stand.",
			null, null, null, true, "2026-01-20T15:30:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-015", "Otoscope Set",
			EquipmentCategory.DIAGNOSTIC_EQUIPMENT, "HSP-2026-006", null,
			7, 5, "Mumbai", EquipmentCondition.GOOD,
			EquipmentAvailability.PARTIALLY_AVAILABLE,
			"Rechargeable otoscope with disposable specula.",
			null, null, null, false, "2026-01-09T09:45:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-016", "Nebulizer Machine",
			EquipmentCategory.RESPIRATORY_SUPPORT, "HSP-2026-006", null,
			14, 10, "Mumbai", EquipmentCondition.GOOD,
			EquipmentAvailability.AVAILABLE,
			"Compressor nebulizer for ward and home use.",
			null, null, null, false, "2026-01-08T11:00:00Z"));
		putEquipment(new MedicalEquipment("EQ-2026-017", "Transport Ventilator (Decommissioned)",
			EquipmentCategory.RESPIRATORY_SUPPORT, "HSP-2026-002", null,
			2, 0, "Pune", EquipmentCondition.MAINTENANCE_REQUIRED,
			EquipmentAvailability.RETIRED,
			"Older ventilator model withdrawn from the sharing pool.",
			"End of life; retained for parts only and not available to borrow.",
			null, null, false, "2026-01-07T09:00:00Z"));
	}

	private void seedRequests() {
		putRequest(new EquipmentRequest("REQ-2026-001", "EQ-2026-001",
			"Multiparameter Patient Monitor", "HSP-2026-002", "HSP-2026-001",
			3, "Seasonal surge \u2014 additional bedside monitoring capacity for 8 days.",
			"2026-01-18", "2026-02-01", "2026-02-09",
			"Sunrise Multispeciality Center, Pune",
			"Requesting hospital arranges pickup from our biomedical store.",
			RequestStatus.PENDING, null, "2026-01-18T12:00:00Z", "2026-01-18T12:00:00Z",
			List.of(new StatusEvent("Pending", "2026-01-18T12:00:00Z", "Request submitted."))));

		putRequest(new EquipmentRequest("REQ-2026-002", "EQ-2026-002",
			"Oxygen Concentrator (5 LPM)", "HSP-2026-003", "HSP-2026-001",
			2, "Coverage during planned maintenance of clinic concentrators.",
			"2026-01-15", "2026-01-28", "2026-02-04",
			"Riverside Community Clinic, Hyderabad", null,
			RequestStatus.APPROVED, null, "2026-01-15T09:30:00Z", "2026-01-19T10:00:00Z",
			List.of(
				new StatusEvent("Pending", "2026-01-15T09:30:00Z", "Request submitted."),
				new StatusEvent("Approved", "2026-01-19T10:00:00Z", "Approved by Aurora City Hospital."))));

		putRequest(new EquipmentRequest("REQ-2026-003", "EQ-2026-003",
			"Folding Wheelchair", "HSP-2026-004", "HSP-2026-001",
			4, "Temporary mobility support during ward renovation.",
			"2026-01-05", "2026-01-10", "2026-01-20",
			"Green Valley Medical Center, Chennai", null,
			RequestStatus.COMPLETED, null, "2026-01-05T08:00:00Z", "2026-01-21T08:00:00Z",
			List.of(
				new StatusEvent("Pending", "2026-01-05T08:00:00Z", "Request submitted."),
				new StatusEvent("Approved", "2026-01-06T09:00:00Z", "Approved."),
				new StatusEvent("Received", "2026-01-10T12:00:00Z", "Delivered and received."),
				new StatusEvent("Returned", "2026-01-19T12:00:00Z", "Returned to owner."),
				new StatusEvent("Completed", "2026-01-21T08:00:00Z", "Cycle closed."))));

		putRequest(new EquipmentRequest("REQ-2026-004", "EQ-2026-004",
			"Automated External Defibrillator (AED)", "HSP-2026-006", "HSP-2026-001",
			2, "Community outreach event first-aid cover.",
			"2026-01-20", "2026-01-26", "2026-01-28",
			"Lakeview General Hospital, Mumbai", null,
			RequestStatus.REJECTED, "All units are reserved for in-house emergency coverage this week.",
			"2026-01-20T09:00:00Z", "2026-01-21T09:00:00Z",
			List.of(
				new StatusEvent("Pending", "2026-01-20T09:00:00Z", "Request submitted."),
				new StatusEvent("Rejected", "2026-01-21T09:00:00Z",
					"All units are reserved for in-house emergency coverage this week."))));

		putRequest(new EquipmentRequest("REQ-2026-005", "EQ-2026-005",
			"Transport Ventilator", "HSP-2026-001", "HSP-2026-002",
			1, "Referral transport requiring ventilated patient support.",
			"2026-01-21", "2026-01-30", "2026-02-02",
			"Aurora City Hospital, Bengaluru", null,
			RequestStatus.PENDING, null, "2026-01-21T10:15:00Z", "2026-01-21T10:15:00Z",
			List.of(new StatusEvent("Pending", "2026-01-21T10:15:00Z", "Request submitted."))));

		putRequest(new EquipmentRequest("REQ-2026-006", "EQ-2026-006",
			"Portable Ultrasound", "HSP-2026-001", "HSP-2026-002",
			1, "Mobile imaging outreach camp for two days.",
			"2026-01-16", "2026-02-05", "2026-02-08",
			"Aurora City Hospital, Bengaluru", null,
			RequestStatus.DISPATCHED, null, "2026-01-16T11:00:00Z", "2026-01-24T11:30:00Z",
			List.of(
				new StatusEvent("Pending", "2026-01-16T11:00:00Z", "Request submitted."),
				new StatusEvent("Approved", "2026-01-20T11:00:00Z", "Approved by Sunrise Multispeciality."),
				new StatusEvent("Dispatched", "2026-01-24T11:30:00Z", "Equipment dispatched."))));

		putRequest(new EquipmentRequest("REQ-2026-007", "EQ-2026-009",
			"Fetal Monitor", "HSP-2026-001", "HSP-2026-003",
			1, "Coverage during in-house monitor servicing.",
			"2026-01-12", "2026-01-24", "2026-01-29",
			"Aurora City Hospital, Bengaluru", null,
			RequestStatus.DISPATCHED, null, "2026-01-12T09:00:00Z", "2026-01-23T09:00:00Z",
			List.of(
				new StatusEvent("Pending", "2026-01-12T09:00:00Z", "Request submitted."),
				new StatusEvent("Approved", "2026-01-14T09:00:00Z", "Approved."),
				new StatusEvent("Dispatched", "2026-01-23T09:00:00Z", "Equipment dispatched."))));

		putRequest(new EquipmentRequest("REQ-2026-008", "EQ-2026-011",
			"12-Lead ECG Machine", "HSP-2026-001", "HSP-2026-004",
			2, "Cardiac screening camp capacity.",
			"2026-01-09", "2026-01-17", "2026-01-22",
			"Aurora City Hospital, Bengaluru", null,
			RequestStatus.RECEIVED, null, "2026-01-09T08:30:00Z", "2026-01-18T08:30:00Z",
			List.of(
				new StatusEvent("Pending", "2026-01-09T08:30:00Z", "Request submitted."),
				new StatusEvent("Approved", "2026-01-10T08:30:00Z", "Approved."),
				new StatusEvent("Dispatched", "2026-01-16T08:30:00Z", "Dispatched."),
				new StatusEvent("Received", "2026-01-18T08:30:00Z", "Received at Aurora City Hospital."))));

		putRequest(new EquipmentRequest("REQ-2026-009", "EQ-2026-010",
			"CPAP Machine", "HSP-2026-001", "HSP-2026-004",
			1, "Short-term respiratory support (later no longer required).",
			"2026-01-08", "2026-01-15", "2026-01-20",
			"Aurora City Hospital, Bengaluru", null,
			RequestStatus.CANCELLED, null, "2026-01-08T08:00:00Z", "2026-01-09T08:00:00Z",
			List.of(
				new StatusEvent("Pending", "2026-01-08T08:00:00Z", "Request submitted."),
				new StatusEvent("Cancelled", "2026-01-09T08:00:00Z", "Cancelled by requesting institution."))));

		putRequest(new EquipmentRequest("REQ-2026-010", "EQ-2026-014",
			"Portable Surgical Light", "HSP-2026-001", "HSP-2026-005",
			1, "Minor procedure room backup lighting.",
			"2026-01-02", "2026-01-06", "2026-01-14",
			"Aurora City Hospital, Bengaluru", null,
			RequestStatus.RECEIVED, null, "2026-01-02T08:00:00Z", "2026-01-06T08:00:00Z",
			List.of(
				new StatusEvent("Pending", "2026-01-02T08:00:00Z", "Request submitted."),
				new StatusEvent("Approved", "2026-01-03T08:00:00Z", "Approved."),
				new StatusEvent("Dispatched", "2026-01-05T08:00:00Z", "Dispatched."),
				new StatusEvent("Received", "2026-01-06T08:00:00Z", "Received."))));
	}

	private void seedTransfers() {
		putTransfer(new EquipmentTransfer("TRF-2026-001", "REQ-2026-002", "EQ-2026-002",
			"Oxygen Concentrator (5 LPM)", "HSP-2026-001", "HSP-2026-003",
			2, null, "2026-02-04", "Awaiting dispatch scheduling.",
			TransferStatus.AWAITING_DISPATCH, "2026-01-19T10:30:00Z", "2026-01-19T10:30:00Z",
			List.of(new StatusEvent("Awaiting Dispatch", "2026-01-19T10:30:00Z", "Prepared from approved request."))));

		putTransfer(new EquipmentTransfer("TRF-2026-002", "REQ-2026-003", "EQ-2026-003",
			"Folding Wheelchair", "HSP-2026-001", "HSP-2026-004",
			4, "2026-01-10", "2026-01-20", "Full cycle completed; units returned and inspected.",
			TransferStatus.COMPLETED, "2026-01-06T09:30:00Z", "2026-01-21T08:00:00Z",
			List.of(
				new StatusEvent("Awaiting Dispatch", "2026-01-06T09:30:00Z", "Prepared."),
				new StatusEvent("Dispatched", "2026-01-09T09:30:00Z", "Dispatched."),
				new StatusEvent("Received", "2026-01-10T12:00:00Z", "Received."),
				new StatusEvent("Return Scheduled", "2026-01-16T12:00:00Z", "Return scheduled."),
				new StatusEvent("Returned", "2026-01-19T12:00:00Z", "Returned."),
				new StatusEvent("Completed", "2026-01-21T08:00:00Z", "Closed."))));

		putTransfer(new EquipmentTransfer("TRF-2026-003", "REQ-2026-006", "EQ-2026-006",
			"Portable Ultrasound", "HSP-2026-002", "HSP-2026-001",
			1, "2026-01-24", "2026-02-08", "Dispatched by owner for outreach camp.",
			TransferStatus.DISPATCHED, "2026-01-20T11:30:00Z", "2026-01-24T11:30:00Z",
			List.of(
				new StatusEvent("Awaiting Dispatch", "2026-01-20T11:30:00Z", "Prepared."),
				new StatusEvent("Dispatched", "2026-01-24T11:30:00Z", "Dispatched."))));

		putTransfer(new EquipmentTransfer("TRF-2026-004", "REQ-2026-007", "EQ-2026-009",
			"Fetal Monitor", "HSP-2026-003", "HSP-2026-001",
			1, "2026-01-23", "2026-01-29", "In transit via partner logistics.",
			TransferStatus.IN_TRANSIT, "2026-01-14T09:30:00Z", "2026-01-23T09:15:00Z",
			List.of(
				new StatusEvent("Awaiting Dispatch", "2026-01-14T09:30:00Z", "Prepared."),
				new StatusEvent("Dispatched", "2026-01-23T09:00:00Z", "Dispatched."),
				new StatusEvent("In Transit", "2026-01-23T09:15:00Z", "In transit."))));

		putTransfer(new EquipmentTransfer("TRF-2026-005", "REQ-2026-008", "EQ-2026-011",
			"12-Lead ECG Machine", "HSP-2026-004", "HSP-2026-001",
			2, "2026-01-16", "2026-01-22", "Received and in use for screening camp.",
			TransferStatus.RECEIVED, "2026-01-10T09:00:00Z", "2026-01-18T08:30:00Z",
			List.of(
				new StatusEvent("Awaiting Dispatch", "2026-01-10T09:00:00Z", "Prepared."),
				new StatusEvent("Dispatched", "2026-01-16T08:30:00Z", "Dispatched."),
				new StatusEvent("Received", "2026-01-18T08:30:00Z", "Received."))));

		putTransfer(new EquipmentTransfer("TRF-2026-006", "REQ-2026-010", "EQ-2026-014",
			"Portable Surgical Light", "HSP-2026-005", "HSP-2026-001",
			1, "2026-01-05", "2026-01-14", "Return scheduled to owner.",
			TransferStatus.RETURN_SCHEDULED, "2026-01-03T09:00:00Z", "2026-01-12T09:00:00Z",
			List.of(
				new StatusEvent("Awaiting Dispatch", "2026-01-03T09:00:00Z", "Prepared."),
				new StatusEvent("Dispatched", "2026-01-05T08:00:00Z", "Dispatched."),
				new StatusEvent("Received", "2026-01-06T08:00:00Z", "Received."),
				new StatusEvent("Return Scheduled", "2026-01-12T09:00:00Z", "Return scheduled."))));
	}

	private void seedActivities() {
		addActivity(new Activity("ACT-2026-006", ActivityType.TRANSFER_UPDATED,
			"Portable Ultrasound dispatched toward Aurora City Hospital.",
			"TRF-2026-003", "Dispatched", "2026-01-24T11:30:00Z"));
		addActivity(new Activity("ACT-2026-005", ActivityType.EQUIPMENT_UPDATED,
			"Updated availability for Automated External Defibrillator (AED).",
			"EQ-2026-004", "Reserved", "2026-01-22T14:00:00Z"));
		addActivity(new Activity("ACT-2026-004", ActivityType.REQUEST_REJECTED,
			"Rejected AED request from Lakeview General Hospital (units reserved).",
			"REQ-2026-004", "Rejected", "2026-01-21T09:00:00Z"));
		addActivity(new Activity("ACT-2026-003", ActivityType.TRANSFER_CREATED,
			"Transfer TRF-2026-001 prepared for the approved oxygen concentrator request.",
			"TRF-2026-001", "Awaiting Dispatch", "2026-01-19T10:30:00Z"));
		addActivity(new Activity("ACT-2026-002", ActivityType.REQUEST_APPROVED,
			"Approved oxygen concentrator request from Riverside Community Clinic.",
			"REQ-2026-002", "Approved", "2026-01-19T10:00:00Z"));
		addActivity(new Activity("ACT-2026-001", ActivityType.REQUEST_SUBMITTED,
			"Sunrise Multispeciality Center requested Multiparameter Patient Monitor.",
			"REQ-2026-001", "Pending", "2026-01-18T12:00:00Z"));
	}

	private void seedSettings() {
		setSettings(new UserSettings(
			new UserSettings.InstitutionSettings(
				"Aurora City Hospital", InstitutionType.HOSPITAL, "Bengaluru",
				"Dr. Meera Nair", "coordination@auroracity.example.in"),
			new UserSettings.UserDisplaySettings(
				"MedShare Administrator", "admin", "Administrator"),
			new UserSettings.NotificationPreferences(
				true, true, false, true)));
	}
}
