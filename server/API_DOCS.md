# 📘 Code Studio API Documentation

**Version:** 1.0.0
**Base URL (production):** `https://studio.koyeb.app/api/v1`
**Local (development):** `http://localhost:5000/api/v1`

> **Base path pattern:** `/api/v{MAJOR}` — when `config.VERSION` is `1.0.0` use `/api/v1`.

---

## ⚠️ Important Notes

* **Authentication uses HTTP-only cookies.** Frontend must send requests with credentials:

  * Fetch API: `{ credentials: 'include' }`
  * Axios: `{ withCredentials: true }`
* **Content-Type:** All `POST` and `PUT` requests should include `Content-Type: application/json`.
* All project endpoints are **protected** and require a valid authenticated session (access token via HTTP-only cookie).

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)

   * Sign up / Sign in / Refresh / Sign out
   * Cookie details
3. [Response Format](#response-format)
4. [Endpoints](#endpoints)

   * Auth endpoints (`/api/v1/auth`)
   * Project endpoints (`/api/v1/projects`)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Related Resources & Support](#related-resources--support)

---

## 🔍 Overview

Code Studio API is a RESTful service for user authentication and managing code projects. Responses are consistent across endpoints and use JWT tokens stored as HTTP-only cookies for security.

Key principles:

* Clear, consistent response format for success and errors.
* Access tokens are short-lived; refresh tokens are longer-lived and used to renew access.
* Frontend must send credentials with requests to receive or refresh cookies.

---

## 🔐 Authentication

Authentication flows are mounted at `/api/v1/auth`.

### Token summary

* **Access Token:** Short-lived (e.g., 15 minutes) — used for API authorization.
* **Refresh Token:** Longer-lived (e.g., 7 days) — used to obtain new access tokens.
* Tokens are delivered and stored as HTTP-only cookies (`accessToken`, `refreshToken`).

### Cookie details

| Cookie Name    | Purpose           | Typical Duration | HTTP-Only | Secure (prod) |
| -------------- | ----------------- | ---------------: | :-------: | :-----------: |
| `accessToken`  | API authorization |      ~15 minutes |     ✅     |       ✅       |
| `refreshToken` | Token refresh     |          ~7 days |     ✅     |       ✅       |

> **Frontend must** include credentials on requests to send/receive these cookies.

---

## ✅ Response Format

All responses follow a consistent JSON envelope.

### Success response

```json
{
  "message": "Human-friendly success message",
  "statusCode": 200,
  "success": true,
  "data": { /* object or array */ }
}
```

### Error response

```json
{
  "message": "Human-friendly error message",
  "statusCode": 400,
  "success": false,
  "errors": [ /* optional details */ ]
}
```

Include helpful `message` text and, when useful, an `errors` array for field-level or validation errors.

---

## 🛣️ Endpoints

### Base mount points

* Auth: `/api/v1/auth`
* Projects: `/api/v1/projects`  (all project routes are protected)

### Auth Endpoints

#### `POST /api/v1/auth/signup`

* **Purpose:** Register a new user and set auth cookies.
* **Headers:** `Content-Type: application/json`
* **Body:**

```json
{ "email": "alice@example.com", "password": "secret123", "name": "Alice" }
```

* **Success:** `201 Created` — sets `accessToken` and `refreshToken` cookies and returns the created user (without password).
* **Errors:** `400 Bad Request` (missing fields / invalid format), `409 Conflict` (email already exists).

---

#### `POST /api/v1/auth/signin`

* **Purpose:** Login user and set auth cookies.
* **Body:**

```json
{ "email": "alice@example.com", "password": "secret123" }
```

* **Success:** `200 OK` — sets cookies and returns user + access token in response body.
* **Errors:** `401 Unauthorized` (invalid credentials).

---

#### `POST /api/v1/auth/refresh-token`

* **Purpose:** Refresh `accessToken` using the `refreshToken` cookie. No request body required.
* **Protected:** Relies on `refreshToken` cookie being present.
* **Success:** `200 OK` — sets new `accessToken` (and optionally a new `refreshToken`) cookies.
* **Errors:** `401 Unauthorized` (missing/invalid/expired refresh token).

---

#### `POST /api/v1/auth/signout`

* **Purpose:** Clear authentication cookies to sign out the user.
* **Success:** `200 OK` — cookies cleared.

Example success body:

```json
{ "message": "Logged out successfully", "statusCode": 200, "success": true, "data": [] }
```

---

### Project Endpoints (mount: `/api/v1/projects`) — **All require authentication**

A Project object (example):

```json
{
  "_id": "507f191e810c19729de860eb",
  "name": "My Awesome Project",
  "userId": "507f191e810c19729de860ea",
  "description": "A sample React project",
  "files": { "index.html": { "code": "<!DOCTYPE html>..." } },
  "visibility": "private",
  "settings": { "framework": "react", "autoSave": true },
  "createdAt": "2025-10-22T10:30:00.000Z",
  "updatedAt": "2025-10-22T10:35:00.000Z"
}
```

#### `GET /api/v1/projects`

* **Purpose:** List projects owned by authenticated user.
* **Success:** `200 OK` — returns `data.projects` array.

Example data shape:

```json
{ "projects": [ { "_id": "...", "name": "My First Project", "visibility": "private", "createdAt": "..." } ] }
```

---

#### `GET /api/v1/projects/:id`

* **Purpose:** Fetch a single project by ID. User must be owner.
* **URL param:** `id` — MongoDB ObjectId
* **Success:** `200 OK` — returns `data.project`.
* **Errors:** `404 Not Found` (project missing), `403 Forbidden` (not owner), `400 Bad Request` (invalid id format).

---

#### `POST /api/v1/projects`

* **Purpose:** Create a new project.
* **Body:**

```json
{
  "name": "My New Project",
  "description": "Optional",
  "files": { "index.html": { "code": "<!DOCTYPE html>..." } },
  "visibility": "private",
  "settings": { "framework": "react", "autoSave": true }
}
```

* **Success:** `201 Created` — returns created `data.project`.
* **Errors:** `400 Bad Request` (missing name/files or invalid format), `401 Unauthorized`.

---

#### `PUT /api/v1/projects/:id`

* **Purpose:** Update project (partial or full). Owner only.
* **Body:** Any subset of the project fields (see `POST` body shape).
* **Success:** `200 OK` — returns updated `data.project`.
* **Errors:** `404 Not Found`, `403 Forbidden`, `400 Bad Request`.

---

#### `DELETE /api/v1/projects/:id`

* **Purpose:** Delete a project. Owner only.
* **Success:** `200 OK` — returns confirmation.
* **Errors:** `404 Not Found`, `403 Forbidden`, `401 Unauthorized`.

---

## 🚦 Rate Limiting

* **Window:** 15 minutes (900,000 ms)
* **Max Requests:** 100 per window
* **Response code:** `429 Too Many Requests`


Rate limit error body:

```json
{
  "message": "Too many requests, please try again later",
  "statusCode": 429,
  "success": false,
  "errors": []
}
```

---

## 🔗 Related Resources & Support

* **Frontend App:** [https://studio.iamabhinav.dev](https://studio.iamabhinav.dev)
* **Portfolio:** [https://iamabhinav.dev](https://iamabhinav.dev)
* **Blog:** [https://blog.iamabhinav.dev](https://blog.iamabhinav.dev)
