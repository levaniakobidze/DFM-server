# API Rules

## API Style
Use REST-style endpoints.

Keep route naming clear and predictable.

Examples:
- GET /api/dares
- GET /api/dares/:id
- POST /api/dares
- POST /api/dares/:id/accept
- POST /api/submissions
- PATCH /api/submissions/:id/approve

---

## Response Shape
Prefer consistent JSON responses.

Successful responses should look like:
```json
{
  "success": true,
  "message": "Dare created successfully",
  "data": {}
}