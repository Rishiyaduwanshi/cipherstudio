


# API Responses 

Base path: `/api/v{MAJOR}` — e.g. if `config.VERSION` is `1.0.0`, use `/api/v1`.

Important:
- Authentication uses HTTP-only cookies. Frontend must send requests with credentials (fetch: `{ credentials: 'include' }` or axios: `{ withCredentials: true }`).


Common response shapes (exact)

Success Response:

{
	"message": "<human friendly>",
	"statusCode": 200,
	"success": true,
	"data": <object|array>
}

Error Response:

{
	"message": "<error message>",
	"statusCode": <number>,
	"success": false,
	"errors": [ /* optional array of error details */ ]
}

---

## Auth (mount point: `/api/v1/auth`)

### POST /api/v1/auth/signup
- Purpose: Create an account and set tokens cookies.
- Request headers: `Content-Type: application/json`
- Body (JSON):

	{
		"email": "alice@example.com",
		"password": "secret123",
		"name": "alice" // optional
	}

- Success (201 Created) — sets `accessToken` and `refreshToken` cookies (HTTP-only):

	{
		"message": "User registered successfully",
		"statusCode": 201,
		"success": true,
		"data": {
			"user": {
				"_id": "507f...",
				"name": "alice",
				"email": "alice@example.com",
				"mobile": null,
				"lastLoggedIn": "2025-10-20T...",
				"settings": { "theme": "light" },
				"createdAt": "2025-10-20T...",
				"updatedAt": "2025-10-20T..."
			},
			"token": "<accessToken>"
		}
	}

- Errors (examples):
	- 400 Bad Request — missing email/password or email already exists
	- Response example:

	{
		"message": "User with this email already exists",
		"statusCode": 400,
		"success": false,
		"errors": []
	}

### POST /api/v1/auth/signin
- Purpose: Login and set token cookies.
- Body (JSON): { "email": string, "password": string }
- Success (200): sets cookies and returns user + access token in body

	{
		"message": "Login successful",
		"statusCode": 200,
		"success": true,
		"data": {
			"user": { /* user object without password */ },
			"token": "<accessToken>"
		}
	}

- Errors:
	- 401 Unauthorized — invalid credentials

### POST /api/v1/auth/refresh-token
- Purpose: Refresh tokens using `refreshToken` cookie. (No body required)
- Protected: <protected> (relies on cookie)
- Success (200): sets new cookies and returns:

	{
		"message": "Token refreshed successfully",
		"statusCode": 200,
		"success": true,
		"data": []
	}

- Errors:
	- 401 Unauthorized — missing/invalid refresh token

### POST /api/v1/auth/signout
- Purpose: Clear auth cookies and logout.
- Protected: <protected>
- Success (200):

	{
		"message": "Logged out successfully",
		"statusCode": 200,
		"success": true,
		"data": []
	}

---

## Projects (mount point: `/api/v1/projects`) — all endpoints require authentication <protected>

Common project sample object (what frontend receives):

{
	"_id": "507f191e810c19729de860eb",
	"name": "My Project",
	"userId": "507f191e810c19729de860ea",
	"description": "",
	"files": {
		"index.html": { "code": "<html>..." },
		"app.js": { "code": "console.log('hi')" }
	},
	"visibility": "private",
	"settings": { "framework": "react", "autoSave": true },
	"createdAt": "2025-10-20T...",
	"updatedAt": "2025-10-20T..."
}

### GET /api/v1/projects  <protected>
- Purpose: Return projects owned by authenticated user.
- Success (200):

	{
		"message": "Projects fetched successfully",
		"statusCode": 200,
		"success": true,
		"data": {
			"projects": [ /* array of project objects */ ]
		}
	}

### GET /api/v1/projects/:id  <protected>
- Purpose: Fetch a single project by id. Must be owner.
- Success (200):

	{
		"message": "Project fetched successfully",
		"statusCode": 200,
		"success": true,
		"data": { "project": { /* project object */ } }
	}

- Errors (examples):
	- 404 Not Found — project doesn't exist
	- 403 Forbidden — project exists but authenticated user is not the owner

	{
		"message": "Project not found",
		"statusCode": 404,
		"success": false,
		"errors": []
	}

### POST /api/v1/projects  <protected>
- Purpose: Create project
- Body (JSON):

	{
		"name": "My Project",
		"files": {
			"index.html": { "code": "<html>..." }
		},
		"description": "Optional",
		"visibility": "private",
		"settings": { "framework": "react", "autoSave": true }
	}

- Success (201):

	{
		"message": "Project created successfully",
		"statusCode": 201,
		"success": true,
		"data": { "project": { /* created project */ } }
	}

### PUT /api/v1/projects/:id  <protected>
- Purpose: Update project fields (owner only)
- Body: partial or full fields to update (same shape as POST body)
- Success (200):

	{
		"message": "Project updated successfully",
		"statusCode": 200,
		"success": true,
		"data": { "project": { /* updated project */ } }
	}

- Errors: 404 Not Found, 403 Forbidden

### DELETE /api/v1/projects/:id  <protected>
- Purpose: Delete a project (owner only)
- Success (200):

	{
		"message": "Project deleted successfully",
		"statusCode": 200,
		"success": true,
		"data": []
	}

---

- 401 Unauthorized: token missing or invalid — frontend should redirect to login.
- 403 Forbidden: show "Not allowed" message.
- 404 Not Found: show "Not found" state.
- 429 Too Many Requests: respect retry-after or show rate-limit message.

