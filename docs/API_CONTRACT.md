# MedShare — Proposed REST API Contract (v1)

> **Status: design only — nothing here is a live endpoint.** No backend exists
> yet and the frontend makes **no HTTP calls** in this phase (`VITE_DATA_MODE`
> defaults to `mock`). This document is the contract a future Spring Boot
> service is expected to satisfy so the frontend service layer
> (`src/services/contracts`) and shared models (`src/types/domain.ts`) can be
> adopted without reshaping the UI. The HTTP modules in `src/services/http`
> are placeholders that throw `NOT_IMPLEMENTED` until this API is built.

## Conventions

- **Base path**: all resources live under `/api/v1`.
- **Content type**: `application/json` on requests and responses (UTF-8).
- **Auth**: `Authorization: Bearer <token>` once a real auth service exists.
  The mock prototype issues **no token**; see §1.
- **Timestamps**: ISO-8601 in UTC with a `Z` suffix (e.g. `2026-10-12T09:30:00Z`).
  Calendar-only dates use `yyyy-mm-dd`.
- **Identifiers**: opaque server-assigned strings, stable across reads.
- **Pagination**: list endpoints accept `?page=0&size=20&sort=updatedAt,desc`
  and return the `PaginatedResponse<T>` envelope (§0.1).
- **Errors**: a single `ApiError` envelope (§0.2) with an appropriate HTTP
  status code.

### 0.1 `PaginatedResponse<T>`

```jsonc
{
  "items": [],
  "page": 0,
  "pageSize": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

### 0.2 `ApiError`

```jsonc
{
  "code": "VALIDATION_ERROR", // see table below
  "message": "Human-readable, user-safe summary",
  "details": { "field": ["message"] }, // optional field-level messages
  "requestId": "c1b2a3-..."            // optional correlation id
}
```

| `code`             | Typical HTTP status | Meaning                                             |
| ------------------ | ------------------- | --------------------------------------------------- |
| `VALIDATION_ERROR` | 400                 | Request body/params failed validation               |
| `UNAUTHORIZED`     | 401                 | Missing or invalid credentials                      |
| `FORBIDDEN`        | 403                 | Authenticated but not permitted for this action      |
| `NOT_FOUND`        | 404                 | Resource does not exist                             |
| `CONFLICT`         | 409                 | State conflict (e.g. insufficient availability)     |
| `RATE_LIMITED`     | 429                 | Too many requests                                   |
| `INTERNAL_ERROR`   | 500                 | Unexpected server failure (never leaks a stack trace) |

The frontend maps every one of these to a `ServiceError` kind
(`src/services/errors.ts`) so the UI handles mock and HTTP failures uniformly.

### 0.3 Shared model reference

Response bodies reuse the canonical models in `src/types/domain.ts`:

- `User`, `Hospital`, `MedicalEquipment`, `EquipmentRequest`,
  `EquipmentTransfer`, `Activity`, `UserSettings`.
- **Request status** (`Pending | Approved | Rejected | Cancelled | Dispatched |
  Received | Returned | Completed`) is intentionally **distinct** from
  **transfer status** (`Awaiting Dispatch | Dispatched | In Transit | Received |
  Return Scheduled | Returned | Completed`).
- No clinical certification or regulatory-compliance fields are modelled.

---

## 1. Authentication

Establishes and inspects a session. The current prototype implements this
**only as a mock** (`admin` / `1234` lives exclusively in
`src/services/mock/auth.ts`); it is a frontend demonstration and is **not
secure against a malicious client**. A real backend must replace it with a
genuine credential store and session mechanism.

### 1.1 `POST /api/v1/auth/login`

- **Purpose**: exchange credentials for a session.
- **Request body**:

  ```jsonc
  { "username": "admin", "password": "1234" }
  ```

- **Success `200`** — returns the authenticated `User`:

  ```jsonc
  {
    "id": "usr-demo-admin",
    "username": "admin",
    "displayName": "MedShare Administrator",
    "role": "ADMIN",
    "email": null,
    "institutionId": "hosp-1"
  }
  ```

- **Errors**: `401 UNAUTHORIZED` (bad credentials, single generic message —
  never reveals which field was wrong), `429 RATE_LIMITED`.

### 1.2 `POST /api/v1/auth/logout`

- **Purpose**: invalidate the current session.
- **Request body**: none.
- **Success `204`**: empty response.
- **Errors**: `401 UNAUTHORIZED` when no session is present.

### 1.3 `GET /api/v1/auth/me`

- **Purpose**: return the currently authenticated `User` (used to restore a
  session on reload).
- **Success `200`**: a `User` object (see §1.1).
- **Errors**: `401 UNAUTHORIZED` when not signed in.

---

## 2. Hospitals

Partner institutions in the sharing network. The prototype renders the
directory **read-only**; `POST`/`PATCH` are proposed but have no UI yet.

### 2.1 `GET /api/v1/hospitals`

- **Purpose**: list/search hospitals.
- **Query**: `?q=&type=&city=&status=&page=0&size=20`.
- **Success `200`**: `PaginatedResponse<Hospital>`.

  ```jsonc
  {
    "items": [
      {
        "id": "hosp-1",
        "name": "Riverbend General Hospital",
        "type": "Hospital",
        "city": "Springfield",
        "region": "Riverside",
        "contactPerson": "Dr. Alina Reyes",
        "contactEmail": "coordinator@riverbend.example",
        "contactPhone": "+1-555-0100",
        "status": "Active",
        "joinedAt": "2026-01-15T08:00:00Z"
      }
    ],
    "page": 0, "pageSize": 20, "totalItems": 1, "totalPages": 1
  }
  ```

- **Errors**: `401 UNAUTHORIZED`.

### 2.2 `GET /api/v1/hospitals/{id}`

- **Purpose**: hospital detail.
- **Success `200`**: a `Hospital`.
- **Errors**: `404 NOT_FOUND`.

### 2.3 `POST /api/v1/hospitals`

- **Purpose**: register a new hospital (starts as `Pending Verification`).
- **Request body**:

  ```jsonc
  {
    "name": "Northgate Clinic",
    "type": "Clinic",
    "city": "Northgate",
    "region": "Highland",
    "contactPerson": "Sam Okafor",
    "contactEmail": "ops@northgate.example",
    "contactPhone": "+1-555-0142"
  }
  ```

- **Success `201`**: the created `Hospital` (server sets `id`, `status`,
  `joinedAt`).
- **Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `409 CONFLICT` (duplicate).

### 2.4 `PATCH /api/v1/hospitals/{id}`

- **Purpose**: update profile / contact info (partial).
- **Request body**: any subset of the writable `Hospital` fields.
- **Success `200`**: the updated `Hospital`.
- **Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 NOT_FOUND`.

---

## 3. Equipment

Shareable assets owned by institutions.

### 3.1 `GET /api/v1/equipment`

- **Purpose**: search/discover equipment with filters.
- **Query**: `?q=&category=&city=&condition=&availability=&minQuantity=&from=&to=&institutionId=&page=&size=`.
- **Success `200`**: `PaginatedResponse<MedicalEquipment>`.

  ```jsonc
  {
    "items": [
      {
        "id": "EQ-2026-0007",
        "name": "Ventilator — Adult",
        "category": "Respiratory Support",
        "institutionId": "hosp-2",
        "internalReference": "VENT-A-14",
        "quantity": 6,
        "availableQuantity": 4,
        "city": "Riverton",
        "condition": "Good",
        "availability": "Partially Available",
        "description": "Transport-capable adult ventilator.",
        "maintenanceNotes": "Last serviced 2026-08.",
        "availableFrom": "2026-10-01",
        "availableUntil": "2026-12-31",
        "documentationOnFile": true,
        "updatedAt": "2026-10-10T14:20:00Z"
      }
    ],
    "page": 0, "pageSize": 20, "totalItems": 1, "totalPages": 1
  }
  ```

- **Errors**: `401 UNAUTHORIZED`.

### 3.2 `GET /api/v1/equipment/{id}`

- **Purpose**: equipment detail.
- **Success `200`**: a `MedicalEquipment`.
- **Errors**: `404 NOT_FOUND`.

### 3.3 `POST /api/v1/equipment`

- **Purpose**: list a new asset (owner only). `id`, `updatedAt` are server-set;
  `availability` is derived from `availableQuantity`/`quantity`.
- **Request body** (a `MedicalEquipment` without `id`/`updatedAt`):

  ```jsonc
  {
    "name": "Infusion Pump",
    "category": "Patient Monitoring",
    "institutionId": "hosp-1",
    "internalReference": "PUMP-22",
    "quantity": 10,
    "availableQuantity": 10,
    "city": "Springfield",
    "condition": "Excellent",
    "availability": "Available",
    "description": "Volumetric infusion pump.",
    "documentationOnFile": true
  }
  ```

- **Success `201`**: the created `MedicalEquipment`.
- **Errors**: `400 VALIDATION_ERROR` (e.g. `availableQuantity > quantity`),
  `403 FORBIDDEN`, `404 NOT_FOUND` (unknown `institutionId`).

### 3.4 `PATCH /api/v1/equipment/{id}`

- **Purpose**: update details / availability (partial).
- **Request body**: any subset of the writable fields.
- **Success `200`**: the updated `MedicalEquipment`.
- **Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 NOT_FOUND`,
  `409 CONFLICT` (a change would drop `availableQuantity` below active reservations).

### 3.5 `DELETE /api/v1/equipment/{id}`

- **Purpose**: retire/remove an asset (owner only).
- **Success `204`**: empty response.
- **Errors**: `403 FORBIDDEN`, `404 NOT_FOUND`,
  `409 CONFLICT` — blocked while open requests or active transfers reference the
  asset (the frontend surfaces the same rule via `getDeleteBlocker`).

---

## 4. Equipment Requests

The borrow/approve workflow. **A request must be approved before any transfer
is dispatched**; approval itself does not dispatch.

Request create takes the draft fields (no `id`, `status`, timestamps, `history`
or denormalized `equipmentName` — the server assigns those):

```jsonc
{
  "equipmentId": "EQ-2026-0007",
  "requestingInstitutionId": "hosp-1",
  "supplyingInstitutionId": "hosp-2",
  "quantity": 2,
  "purpose": "Surge coverage for respiratory ward",
  "requestedDate": "2026-10-12",
  "requiredDate": "2026-10-20",
  "expectedReturnDate": "2026-11-05",
  "deliveryLocation": "Riverbend General, Loading Bay B",
  "notes": "Coordinator will confirm receipt window."
}
```

### 4.1 `GET /api/v1/requests`

- **Purpose**: list requests, optionally scoped to the caller.
- **Query**: `?direction=all|incoming|outgoing&status=&q=&page=&size=`.
- **Success `200`**: `PaginatedResponse<EquipmentRequest>`.

  ```jsonc
  {
    "items": [
      {
        "id": "REQ-2026-0031",
        "equipmentId": "EQ-2026-0007",
        "equipmentName": "Ventilator — Adult",
        "requestingInstitutionId": "hosp-1",
        "supplyingInstitutionId": "hosp-2",
        "quantity": 2,
        "purpose": "Surge coverage for respiratory ward",
        "requestedDate": "2026-10-12",
        "requiredDate": "2026-10-20",
        "expectedReturnDate": "2026-11-05",
        "deliveryLocation": "Riverbend General, Loading Bay B",
        "status": "Pending",
        "createdAt": "2026-10-12T09:00:00Z",
        "updatedAt": "2026-10-12T09:00:00Z",
        "history": [
          { "status": "Pending", "at": "2026-10-12T09:00:00Z", "note": "Request submitted." }
        ]
      }
    ],
    "page": 0, "pageSize": 20, "totalItems": 1, "totalPages": 1
  }
  ```

- **Errors**: `401 UNAUTHORIZED`.

### 4.2 `GET /api/v1/requests/{id}`

- **Purpose**: request detail with status history.
- **Success `200`**: an `EquipmentRequest`.
- **Errors**: `404 NOT_FOUND`.

### 4.3 `POST /api/v1/requests`

- **Purpose**: create and submit a request (starts `Pending`).
- **Request body**: the draft above.
- **Success `201`**: the created `EquipmentRequest`.
- **Errors**: `400 VALIDATION_ERROR` (e.g. `quantity < 1`, empty `purpose`),
  `404 NOT_FOUND` (unknown equipment), `409 CONFLICT` (requested quantity
  exceeds current `availableQuantity`).

### 4.4 `POST /api/v1/requests/{id}/approve`

- **Purpose**: the supplying institution approves a `Pending` request; approval
  reserves the requested units against the equipment.
- **Request body**: none (optional `{ "note": "..." }`).
- **Success `200`**: the updated `EquipmentRequest` (`status = "Approved"`).
- **Errors**: `403 FORBIDDEN` (not the supplier), `404 NOT_FOUND`,
  `409 CONFLICT` (not `Pending`, equipment flagged `Unavailable`, or availability
  dropped below the requested quantity since submission).

### 4.5 `POST /api/v1/requests/{id}/reject`

- **Purpose**: the supplying institution declines a `Pending` request.
- **Request body**: `{ "reason": "Unit scheduled for maintenance." }` (required, non-empty).
- **Success `200`**: the updated `EquipmentRequest` (`status = "Rejected"`,
  `rejectReason` set).
- **Errors**: `400 VALIDATION_ERROR` (empty reason), `403 FORBIDDEN`,
  `404 NOT_FOUND`, `409 CONFLICT` (not `Pending`).

### 4.6 `POST /api/v1/requests/{id}/cancel`

- **Purpose**: the requesting institution cancels its own `Pending` request.
- **Request body**: none.
- **Success `200`**: the updated `EquipmentRequest` (`status = "Cancelled"`).
- **Errors**: `403 FORBIDDEN` (not the requester), `404 NOT_FOUND`,
  `409 CONFLICT` (not `Pending`).

---

## 5. Equipment Transfers

Physical movement of an **approved** request. Movement is a strict sequence and
each step is recorded by the owning side: **approval ≠ dispatch, dispatch ≠
receipt, receipt ≠ return.** Availability is released only on completion.

### 5.1 `GET /api/v1/transfers`

- **Purpose**: list transfers (active / history).
- **Query**: `?status=&q=&page=&size=`.
- **Success `200`**: `PaginatedResponse<EquipmentTransfer>`.

  ```jsonc
  {
    "items": [
      {
        "id": "TRF-2026-0009",
        "requestId": "REQ-2026-0031",
        "equipmentId": "EQ-2026-0007",
        "equipmentName": "Ventilator — Adult",
        "sendingInstitutionId": "hosp-2",
        "receivingInstitutionId": "hosp-1",
        "quantity": 2,
        "dispatchDate": null,
        "expectedReturn": "2026-11-05",
        "handoverNotes": "Prepared from approved request.",
        "status": "Awaiting Dispatch",
        "createdAt": "2026-10-12T10:05:00Z",
        "updatedAt": "2026-10-12T10:05:00Z",
        "timeline": [
          { "status": "Awaiting Dispatch", "at": "2026-10-12T10:05:00Z", "note": "Prepared from approved request." }
        ]
      }
    ],
    "page": 0, "pageSize": 20, "totalItems": 1, "totalPages": 1
  }
  ```

- **Errors**: `401 UNAUTHORIZED`.

### 5.2 `GET /api/v1/transfers/{id}`

- **Purpose**: transfer detail with the full status timeline.
- **Success `200`**: an `EquipmentTransfer`.
- **Errors**: `404 NOT_FOUND`.

### 5.3 `POST /api/v1/transfers`

- **Purpose**: prepare a transfer from an approved request.
- **Request body**: `{ "requestId": "REQ-2026-0031" }`.
- **Success `201`**: the created `EquipmentTransfer` (`status = "Awaiting Dispatch"`).
- **Errors**: `403 FORBIDDEN`, `404 NOT_FOUND` (unknown request),
  `409 CONFLICT` (request is not `Approved`, or a transfer already exists for it).

### 5.4 `POST /api/v1/transfers/{id}/dispatch`

- **Purpose**: the **sending** institution records that the units left. Moves the
  transfer to `Dispatched` (and mirrors `Dispatched` onto the linked request).
- **Request body**: optional `{ "note": "..." }`.
- **Success `200`**: the updated `EquipmentTransfer`.
- **Errors**: `403 FORBIDDEN` (caller is not the sender), `404 NOT_FOUND`,
  `409 CONFLICT` (transfer is not in a dispatchable state, i.e. not `Awaiting Dispatch`).

### 5.5 `POST /api/v1/transfers/{id}/receive`

- **Purpose**: the **receiving** institution confirms arrival. Moves the transfer
  to `Received` (mirrors `Received` onto the request). Receipt does **not** imply
  return.
- **Request body**: optional `{ "note": "..." }`.
- **Success `200`**: the updated `EquipmentTransfer`.
- **Errors**: `403 FORBIDDEN` (caller is not the receiver), `404 NOT_FOUND`,
  `409 CONFLICT` (not yet dispatched / invalid transition).

### 5.6 `POST /api/v1/transfers/{id}/return`

- **Purpose**: record the equipment going back and, at the sender's confirmation
  of return-and-inspection, complete the cycle (`Returned` → `Completed`). Only
  on **completion** is the reserved quantity released to inventory.
- **Request body**: `{ "stage": "Return Scheduled" | "Returned" | "Completed", "note": "..."? }`.
- **Success `200`**: the updated `EquipmentTransfer`.
- **Errors**: `403 FORBIDDEN` (wrong side for the stage), `404 NOT_FOUND`,
  `409 CONFLICT` (invalid transition, e.g. completing before `Returned`).

---

## 6. Activity and settings

### 6.1 `GET /api/v1/activities`

- **Purpose**: newest-first activity history for the caller's workspace. Entries
  are produced as side effects of equipment/request/transfer/settings actions —
  they are not written directly by clients.
- **Query**: `?type=&from=&to=&page=&size=`.
- **Success `200`**: `PaginatedResponse<Activity>`.

  ```jsonc
  {
    "items": [
      {
        "id": "ACT-2026-0114",
        "type": "request_approved",
        "description": "Approved request REQ-2026-0031 for Ventilator — Adult. 2 unit(s) reserved.",
        "relatedId": "REQ-2026-0031",
        "status": "Approved",
        "at": "2026-10-12T10:00:00Z"
      }
    ],
    "page": 0, "pageSize": 20, "totalItems": 1, "totalPages": 1
  }
  ```

- **Errors**: `401 UNAUTHORIZED`.

### 6.2 `GET /api/v1/settings`

- **Purpose**: the current workspace settings.
- **Success `200`**: a `UserSettings`.

  ```jsonc
  {
    "institution": {
      "name": "Riverbend General Hospital",
      "type": "Hospital",
      "city": "Springfield",
      "contactPerson": "Dr. Alina Reyes",
      "workEmail": "coordinator@riverbend.example"
    },
    "user": { "displayName": "MedShare Administrator", "username": "admin", "role": "ADMIN" },
    "preferences": {
      "emailOnNewRequest": true,
      "emailOnRequestDecision": true,
      "emailOnTransferUpdate": false,
      "weeklyDigest": false
    }
  }
  ```

- **Errors**: `401 UNAUTHORIZED`.

### 6.3 `PATCH /api/v1/settings`

- **Purpose**: partial update, merged by section
  (`institution` / `user` / `preferences`). Passwords are never part of this
  resource and are never stored.
- **Request body**: any subset of the `UserSettings` sections.
- **Success `200`**: the updated `UserSettings`.
- **Errors**: `400 VALIDATION_ERROR` (e.g. blank institution/user name),
  `401 UNAUTHORIZED`, `403 FORBIDDEN`.

---

## Frontend alignment

- Every resource maps to a canonical interface in `src/types/domain.ts` and a
  service contract in `src/services/contracts` (`AuthService`,
  `HospitalService`, `EquipmentService`, `RequestService`, `TransferService`,
  `ActivityService`, `SettingsService`).
- The mock implementations (`src/services/mock`) satisfy these contracts against
  the centralized workspace store. When this API exists, replace the bodies in
  `src/services/http` with calls through `apiClient` (`src/services/api/client.ts`)
  — the contract, and therefore the whole UI, stays unchanged.

## Open questions (to resolve when the backend is built)

- Session strategy (JWT vs. server-side session) and refresh flow.
- Role-based authorization for approve/reject and each transfer stage.
- Notification model for request and transfer status changes.
- Whether `GET` list endpoints should be paginated from day one or start simple.
