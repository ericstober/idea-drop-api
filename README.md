# IdeaDrop API

Backend API for the IdeaDrop application - a full-stack project that allows users to create, share, and manage ideas.

## Overview

Idea Drop API is a RESTful backend built with Node.js, Express, and MongoDB that powers the Idea Drop UI. It provides authentication, idea management, and secure token-based sessions.
This API supports:

- User authentication (JWT-based)
- Idea CRUD operations
- Protected routes
- Refresh token flow using HTTP-only cookies

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT (jose)
- bcryptjs
- cookie-parser
- cors

## Authentication Flow

- User register/login -> receive:
  - accessToken (short-lived)
  - refreshToken (stored in HTTP-only cookie)
- Access tokens are sent via Authorization: Bearer
- When expired -> /api/auth/refresh issues a new token
- Logout clears the refresh token cookie

This pattern improves security by:

- Preventing XSS access to refresh tokens
- Allowing seamless session renewal

## Project Structure

```
config/        # Database connection
middleware/    # Auth + error handling
models/        # Mongoose schemas
routes/        # API route handlers
utils/         # JWT + helpers
server.js      # Entry point

```

## API Endpoints

Auth Routes (/api/auth)

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| POST   | /register | Register a new user  |
| POST   | /login    | Login user           |
| POST   | /logout   | Logout user          |
| POST   | /refresh  | Refresh access token |

Idea Routes (/api/ideas)

| Method | Endpoint | Description              |
| ------ | -------- | ------------------------ |
| GET    | /        | Get all ideas            |
| GET    | /:id     | Get single idea          |
| POST   | /        | Create idea (protected)  |
| PUT    | /:id     | Update idea (owner only) |
| DELETE | /:id     | Delete idea (owner only) |

## Key Features

- JWT authentication with refresh tokens
- Secure HTTP-only cookies
- Route protection middleware
- Ownership validation (users can only modify their ideas)
- Input validation and error handling
- Tag parsing (string -> array support)

## Installation

```
git clone https://github.com/ericstober/idea-drop-api.git
cd idea-drop-api
npm install
```

## Environment Variables

Create a .env file in the root:

```
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## Run the Server

```
npm run dev
```

## Frontend (UI)

This API is designed to work with the IdeaDrop UI frontend:

[IdeaDrop UI Repo](https://github.com/ericstober/idea-drop-ui)

The UI handles routing, state, and user interaction, while this API provides the data and authentication layer.

## Example Request

Create Idea (Protected)

```
POST /api/ideas
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "New App Idea",
  "summary": "Short summary",
  "description": "Detailed description",
  "tags": "startup,ai"
}
```

## Future Improvements

- Pagination + filtering
- Search by tags/keywords
- Rate limiting (auth routes)
- Refresh token rotation
- Role-based access control
- API documentation (Swagger)
