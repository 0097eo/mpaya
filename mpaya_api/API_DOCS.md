# M-Paya Energy — API Documentation

Base URL: `http://localhost:8000/api/v1`

All endpoints except login require the header:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST `/auth/login/`
Obtain JWT tokens.

**Request**
```json
{
  "username": "tech1",
  "password": "mpaya1234"
}
```

**Response 200**
```json
{
  "access": "<access_token>",
  "refresh": "<refresh_token>",
  "user": {
    "id": "uuid",
    "email": "tech1@mpaya.com",
    "role": "technician",
    "is_verified": true
  }
}
```

---

### POST `/auth/refresh/`
Refresh access token.

**Request**
```json
{ "refresh": "<refresh_token>" }
```

**Response 200**
```json
{ "access": "<new_access_token>" }
```

---

### POST `/auth/logout/`
Blacklist refresh token.

**Request**
```json
{ "refresh": "<refresh_token>" }
```

**Response 200**
```json
{ "message": "Logged out successfully." }
```

---

### GET `/auth/me/`
Get current user profile.

**Response 200**
```json
{
  "id": "uuid",
  "username": "tech1",
  "email": "tech1@mpaya.com",
  "role": "technician",
  "is_verified": true
}
```

---

## Tickets

### GET `/tickets/`
List tickets.

- **Technician**: returns tickets with their assignment date to the authenticated user
- **Admin/Superadmin**: returns all tickets with optional filters

**Query Parameters (admin only)**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by `pending`, `in_progress`, or `resolved` |
| `date` | string (YYYY-MM-DD) | Filter by creation date |
| `technician` | username | Filter by assigned technician ID |

**Response 200**
```json
[
  {
    "id": "uuid",
    "title": "Meter fault at Unit 4B",
    "meter_serial_number": "MTR-2024-001",
    "status": "pending",
    "assigned_to": {
      "id": "uuid",
      "username": "tech1",
      "email": "tech1@mpaya.com"
    },
    "created_at": "2026-03-16T08:00:00Z"
  }
]
```

---

### POST `/tickets/`
Create a ticket. **Admin only.**

**Request**
```json
{
  "title": "Meter fault at Unit 4B",
  "description": "Tenant reports meter not vending tokens after payment.",
  "meter_serial_number": "MTR-2024-001",
  "assigned_to": "<technician_user_uuid>"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "title": "Meter fault at Unit 4B",
  "meter_serial_number": "MTR-2024-001",
  "status": "pending",
  "assigned_to": "<uuid>",
  "created_at": "2026-03-16T08:00:00Z"
}
```

**Error 400** — if assigned_to is not a technician
```json
{
  "error": true,
  "message": "Tickets can only be assigned to technicians."
}
```

---

### GET `/tickets/{id}/`
Get full ticket detail.

- Technicians can only retrieve their own assigned tickets.

**Response 200**
```json
{
  "id": "uuid",
  "title": "Meter fault at Unit 4B",
  "description": "Tenant reports meter not vending tokens after payment.",
  "meter_serial_number": "MTR-2024-001",
  "status": "in_progress",
  "assigned_to": { "id": "uuid", "username": "tech1", "email": "tech1@mpaya.com" },
  "created_by": { "id": "uuid", "username": "admin", "email": "admin@mpaya.com" },
  "resolution_summary": "",
  "resolved_meter_serial": "",
  "resolved_at": null,
  "created_at": "2026-03-16T08:00:00Z",
  "updated_at": "2026-03-16T09:00:00Z"
}
```

---

### PATCH `/tickets/{id}/status/`
Move ticket to `in_progress`. Technician only.

Cannot skip to resolved — use `/resolve/` for that.

**Request**
```json
{ "status": "in_progress" }
```

**Response 200**
```json
{
  "id": "uuid",
  "status": "in_progress",
  "message": "Ticket marked as in progress."
}
```

**Error 400** — if ticket is already resolved
```json
{
  "error": true,
  "message": "Resolved tickets cannot be updated."
}
```

**Error 403** — if technician is not assigned to this ticket
```json
{
  "error": true,
  "message": "You are not assigned to this ticket."
}
```

---

### POST `/tickets/{id}/resolve/`
Resolve a ticket. **Core close-loop endpoint.**

Both fields are mandatory. The `resolved_meter_serial` must exactly match the `meter_serial_number` on the ticket record. The backend rejects any request that fails either condition.

**Request**
```json
{
  "resolution_summary": "Replaced faulty relay switch. Meter now vending correctly. Tested with KES 50 token purchase.",
  "resolved_meter_serial": "MTR-2024-001"
}
```

**Response 200**
```json
{
  "id": "uuid",
  "status": "resolved",
  "resolved_at": "2026-03-16T11:30:00Z",
  "message": "Ticket resolved successfully."
}
```

**Error 400** — missing resolution summary
```json
{
  "error": true,
  "message": "Resolution summary is required to close a ticket."
}
```

**Error 400** — serial number mismatch
```json
{
  "resolved_meter_serial": "Meter serial number does not match ticket record. Expected: MTR-2024-001."
}
```

**Error 400** — ticket already resolved
```json
{
  "error": true,
  "message": "Ticket is already resolved."
}
```

**Error 403** — wrong technician
```json
{
  "error": true,
  "message": "You are not assigned to this ticket."
}
```

---

### GET `/tickets/technicians/`
List all technician users. **Admin only.** Used for ticket assignment dropdown.

**Response 200**
```json
[
  {
    "id": "uuid",
    "username": "tech1",
    "email": "tech1@mpaya.com",
    "role": "technician"
  }
]
```

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "error": true,
  "message": "Human-readable error description.",
  "status_code": 400
}
```

Field-level validation errors return the field name as the key:

```json
{
  "resolved_meter_serial": "Meter serial number does not match ticket record."
}
```

---

## Status Flow

```
pending  →  in_progress  →  resolved
```

- A ticket cannot skip from `pending` directly to `resolved`
- A resolved ticket cannot be updated
- Only the assigned technician can update or resolve their ticket
