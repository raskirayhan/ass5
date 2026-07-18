# FixItNow API Overview

## Base URL
- Development: `http://localhost:3000`
- Production: `https://fixitnow-api.onrender.com`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

### Paginated
```json
{
  "success": true,
  "message": "Success",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "errorDetails": ["field: specific error"]
}
```

## Roles
- **CUSTOMER**: Browse, book, pay, review
- **TECHNICIAN**: Manage profile, availability, handle bookings
- **ADMIN**: Full platform management
