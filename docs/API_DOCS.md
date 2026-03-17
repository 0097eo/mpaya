# M-Paya Energy — API Documentation

Base URL: `http://localhost:8000/api/v1`

All endpoints except `/auth/login/` require the header:
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
    "username": "tech1",
    "email": "tech1@mpaya.com",
    "role": "technician"
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
  "role": "technician"
}
```

---

## Team Management

### GET `/auth/technicians/`
List all technician accounts. **Admin only.**

**Response 200**
```json
[
  {
    "id": "uuid",
    "username": "tech1",
    "email": "tech1@mpaya.com",
    "role": "technician",
    "date_joined": "2026-03-01T08:00:00Z"
  }
]
```

---

### POST `/auth/technicians/`
Create a technician account. **Admin only.**

**Request**
```json
{
  "username": "tech2",
  "email": "tech2@mpaya.com",
  "password": "securepass"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "username": "tech2",
  "email": "tech2@mpaya.com",
  "role": "technician",
  "date_joined": "2026-03-17T10:00:00Z"
}
```

---

### DELETE `/auth/technicians/{id}/`
Deactivate a technician account. **Admin only.** Sets `is_active = false` — reversible from Django admin.

**Response 200**
```json
{ "message": "tech2 has been deactivated." }
```

---

### GET `/auth/support/`
List all customer support accounts. **Admin only.**

**Response 200**
```json
[
  {
    "id": "uuid",
    "username": "support.wanjiku",
    "email": "wanjiku@mpaya.com",
    "role": "support",
    "date_joined": "2026-03-01T08:00:00Z"
  }
]
```

---

### POST `/auth/support/`
Create a customer support account. **Admin only.**

**Request**
```json
{
  "username": "support.wanjiku",
  "email": "wanjiku@mpaya.com",
  "password": "securepass"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "username": "support.wanjiku",
  "email": "wanjiku@mpaya.com",
  "role": "support",
  "date_joined": "2026-03-17T10:00:00Z"
}
```

---

### DELETE `/auth/support/{id}/`
Deactivate a support account. **Admin only.**

**Response 200**
```json
{ "message": "support.wanjiku has been deactivated." }
```

---

## Tickets

### GET `/tickets/`
List tickets.

- **Technician**: returns today's assigned tickets only
- **Admin / Support**: returns all tickets with optional filters, paginated (20 per page)

**Query Parameters (admin/support only)**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by `pending`, `in_progress`, or `resolved` |
| `date` | string (YYYY-MM-DD) | Filter by creation date |
| `technician` | string | Filter by assigned technician username (partial match) |
| `page` | integer | Page number (default: 1) |

**Response 200**
```json
{
  "count": 143,
  "next": "http://localhost:8000/api/v1/tickets/?page=2",
  "previous": null,
  "results": [
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
}
```

---

### POST `/tickets/`
Create a ticket. **Admin and Support only.**

`assigned_to` is optional — tickets can be created unassigned and assigned later.

**Request**
```json
{
  "title": "Meter fault at Unit 4B",
  "description": "Tenant reports meter not vending tokens after payment.",
  "meter_serial_number": "MTR-2024-001",
  "assigned_to": "" 
}
```

**Response 201**
```json
{
  "id": "uuid",
  "title": "Meter fault at Unit 4B",
  "meter_serial_number": "MTR-2024-001",
  "status": "pending",
  "assigned_to": " or null",
  "created_at": "2026-03-16T08:00:00Z"
}
```

**Error 400** — assigned_to is not a technician
```json
{ "assigned_to": "Tickets can only be assigned to technicians." }
```

---

### PATCH `/tickets/{id}/assign/`
Assign or reassign a technician. **Admin and Support only.**

If the ticket is currently `in_progress`, it resets to `pending` on reassignment.
Cannot reassign a resolved ticket.

**Request**
```json
{ "assigned_to": "<technician_user_uuid>" }
```

**Response 200 — first assignment**
```json
{
  "id": "uuid",
  "assigned_to": {
    "id": "uuid",
    "username": "tech1",
    "email": "tech1@mpaya.com"
  },
  "status": "pending",
  "message": "Ticket assigned to tech1."
}
```

**Response 200 — reassignment from in_progress**
```json
{
  "id": "uuid",
  "assigned_to": {
    "id": "uuid",
    "username": "tech2",
    "email": "tech2@mpaya.com"
  },
  "status": "pending",
  "message": "Ticket reassigned to tech2 and reset to pending."
}
```

**Error 400** — ticket is resolved
```json
{ "error": true, "message": "Resolved tickets cannot be reassigned." }
```

**Error 404** — ticket not found
```json
{ "error": true, "message": "Ticket not found." }
```

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
  "created_by": { "id": "uuid", "username": "support.wanjiku", "email": "wanjiku@mpaya.com" },
  "resolution_summary": null,
  "resolved_meter_serial": null,
  "resolved_at": null,
  "created_at": "2026-03-16T08:00:00Z",
  "updated_at": "2026-03-16T09:00:00Z"
}
```

---

### PATCH `/tickets/{id}/status/`
Move ticket to `in_progress`. **Technician only.**

Cannot skip to `resolved` — use `/resolve/` for that.

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

**Error 400** — ticket already resolved
```json
{ "error": true, "message": "Resolved tickets cannot be updated." }
```

**Error 400** — ticket already in progress
```json
{ "error": true, "message": "Ticket is already in progress." }
```

**Error 403** — not assigned to this ticket
```json
{ "error": true, "message": "You are not assigned to this ticket." }
```

---

### POST `/tickets/{id}/resolve/`
Resolve a ticket. **Technician only. Core close-loop endpoint.**

Both fields are mandatory. `resolved_meter_serial` must exactly match the `meter_serial_number` on the ticket record. The ticket must be `in_progress` before it can be resolved.

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

**Error 400** — serial mismatch
```json
{ "resolved_meter_serial": "Meter serial number does not match ticket record." }
```

**Error 400** — ticket still pending
```json
{ "error": true, "message": "Ticket must be in progress before it can be resolved." }
```

**Error 400** — already resolved
```json
{ "error": true, "message": "Ticket is already resolved." }
```

**Error 403** — not assigned
```json
{ "error": true, "message": "You are not assigned to this ticket." }
```

---

### GET `/tickets/technicians/`
List technicians for ticket assignment dropdown. **Admin and Support.**

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
- A resolved ticket cannot be updated or reassigned
- Only the assigned technician can update or resolve their ticket
- A ticket must be assigned before a technician can act on it
- Reassigning a ticket that is `in_progress` resets it to `pending`
- Unassigned tickets are only visible to admin and support users