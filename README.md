# Video Moderation Frontend

A React + Vite frontend for a multi-tenant video moderation platform.  
Users can register and log in, upload videos (role-based), track processing progress in real time, browse/filter library items, and play safe videos.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Installation and Setup Guide](#installation-and-setup-guide)
- [Environment Variables](#environment-variables)
- [User Manual](#user-manual)
- [API Documentation](#api-documentation)
- [Architecture Overview](#architecture-overview)
- [Assumptions and Design Decisions](#assumptions-and-design-decisions)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)

## Tech Stack

- React 19 + TypeScript
- Vite 8
- React Router
- Zustand (state management)
- Axios (HTTP client)
- Socket.IO client (real-time progress)
- Tailwind CSS 4 + shadcn styling primitives
- react-hot-toast (notifications)
- react-dropzone (file upload UX)

## Installation and Setup Guide

### 1) Prerequisites

- Node.js 20+ (recommended LTS)
- npm 10+
- Running backend API + Socket.IO server

### 2) Clone and install

```bash
git clone <repo-url>
cd frontend
npm install
```

### 3) Configure environment

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4) Run the app

```bash
npm run dev
```

Open the URL shown by Vite (typically `http://localhost:5173`).

### 5) Production build

```bash
npm run build
npm run preview
```

## Environment Variables

| Variable          | Required | Example                     | Purpose                                   |
| ----------------- | -------- | --------------------------- | ----------------------------------------- |
| `VITE_API_URL`    | Yes      | `http://localhost:5000/api` | Base URL for REST API calls               |
| `VITE_SOCKET_URL` | Yes      | `http://localhost:5000`     | Socket.IO server URL for progress updates |

## User Manual

### Roles

- **Viewer**
    - Can view dashboard and library
    - Can open safe videos in player
    - Cannot upload or delete videos
- **Editor**
    - All viewer capabilities
    - Can upload videos
    - Can delete videos
- **Admin**
    - All editor capabilities
    - Can access admin panel (`/admin`) to view users

### Authentication flow

1. Go to `/register` to create an account (name, email, password, role) or `/login`.
2. On successful auth, token is stored in browser `localStorage`.
3. Protected routes redirect unauthenticated users to `/login`.
4. If any API request returns `401`, token is cleared and user is redirected to `/login`.

### Dashboard (`/`)

- Shows:
    - Total videos
    - Safe videos
    - Flagged videos
- Displays:
    - Processing section for in-progress uploads/transcoding/moderation
    - Recent videos list
- Upload panel appears only for `editor` and `admin`.
- Real-time progress bars update via Socket.IO channels (`progress:<videoId>`).

### Uploading videos

In the upload panel:

1. Drag/drop or browse a single video file.
2. Allowed extensions include: `.mp4`, `.mkv`, `.webm`, `.avi`, `.mov`.
3. Max file size: **500 MB**.
4. Provide required title and optional description.
5. Submit upload and watch processing status update.

### Library (`/library`)

- Search by title
- Filter by status (`all`, `safe`, `flagged`, `processing`)
- Sort by:
    - Date (`createdAt`)
    - Size
    - Duration
- Click a safe video card (or Watch button) to open player.

### Player (`/player/:id`)

- Loads video metadata first
- Streams video only if status is `safe`
- For non-safe statuses (`processing`, `uploading`, `flagged`), playback is blocked with a status message

### Admin panel (`/admin`)

- Access restricted to `admin` role
- Shows:
    - User counts (total/editors/viewers)
    - User list with name, email, role, tenant id preview, join date

## API Documentation

The frontend expects the following backend endpoints and contracts.

### Auth endpoints

#### `POST /auth/login`

- Request body:
    ```json
    { "email": "user@example.com", "password": "password123" }
    ```
- Expected response:
    ```json
    {
        "token": "jwt-token",
        "user": {
            "id": "user-id",
            "name": "Jane",
            "email": "user@example.com",
            "role": "viewer|editor|admin",
            "tenantId": "tenant-id"
        }
    }
    ```

#### `POST /auth/register`

- Request body:
    ```json
    {
        "name": "Jane",
        "email": "user@example.com",
        "password": "password123",
        "role": "viewer|editor|admin"
    }
    ```
- Expected response shape: same as login (`token` + `user`)

#### `GET /auth/me`

- Auth required (`Authorization: Bearer <token>`)
- Expected response:
    ```json
    {
        "id": "user-id",
        "name": "Jane",
        "email": "user@example.com",
        "role": "viewer|editor|admin",
        "tenantId": "tenant-id"
    }
    ```

#### `GET /auth/users` (admin)

- Auth required
- Expected response:
    ```json
    [
        {
            "_id": "user-id",
            "name": "Jane",
            "email": "user@example.com",
            "role": "viewer|editor|admin",
            "tenantId": "tenant-id",
            "createdAt": "2026-01-01T12:00:00.000Z"
        }
    ]
    ```

### Video endpoints

#### `GET /videos`

- Auth required
- Optional query: `status` (`safe|flagged|processing|uploading`)
- Expected response:
    ```json
    [
        {
            "_id": "video-id",
            "title": "Video title",
            "description": "Optional description",
            "filename": "stored-file-name.mp4",
            "originalName": "input-file-name.mp4",
            "size": 1234567,
            "duration": 95,
            "status": "uploading|processing|safe|flagged",
            "sensitivityScore": 12,
            "processingProgress": 80,
            "uploadedBy": { "name": "Jane", "email": "user@example.com" },
            "createdAt": "2026-01-01T12:00:00.000Z"
        }
    ]
    ```

#### `GET /videos/:id`

- Auth required
- Returns one video object (shape above)

#### `POST /videos/upload`

- Auth required
- Multipart form-data:
    - `video` (file)
    - `title` (string, required)
    - `description` (string, optional)
- Expected response:
    ```json
    {
        "video": {
            "_id": "video-id",
            "title": "Video title",
            "status": "uploading|processing",
            "processingProgress": 0
        }
    }
    ```

#### `DELETE /videos/:id`

- Auth required (`editor`/`admin` expected by UI logic)
- Expected response: success status code (`200`/`204`)

#### `GET /videos/:id/stream`

- Auth required
- Returns binary video stream/blob
- Used only for videos with status `safe`

### Socket.IO events

- Client connects to `VITE_SOCKET_URL`
- Frontend listens on per-video channels:
    - Event name: `progress:<videoId>`
    - Payload:
        ```json
        { "progress": 0 }
        ```
- When `progress` reaches `100`, frontend re-fetches video list.

### HTTP behavior implemented in frontend

- Adds `Authorization` bearer token automatically if token exists in `localStorage`.
- On `401` response:
    - removes token from `localStorage`
    - redirects user to `/login`

## Architecture Overview

### High-level flow

1. `main.tsx` bootstraps app, router, and toasts.
2. `App.tsx` declares public/protected routes and shared navbar for protected pages.
3. Zustand stores (`authStore`, `videoStore`) hold global app state and expose async actions.
4. `services/api.ts` centralizes Axios config/interceptors.
5. `services/socket.ts` maintains a singleton Socket.IO client.
6. Pages compose UI and call store actions.

### Folder structure

```text
src/
  components/
    Navbar.tsx
    ProtectedRoute.tsx
    UploadZone.tsx
    VideoCard.tsx
  pages/
    Login.tsx
    Register.tsx
    Dashboard.tsx
    Library.tsx
    Player.tsx
    Admin.tsx
  services/
    api.ts
    socket.ts
  store/
    authStore.ts
    videoStore.ts
  App.tsx
  main.tsx
```

### Route map

- Public:
    - `/login`
    - `/register`
- Protected:
    - `/` (Dashboard)
    - `/library`
    - `/player/:id`
    - `/admin` (admin checked in page-level logic)

## Assumptions and Design Decisions

### Assumptions

- Backend handles core authorization rules by role and tenant isolation.
- Backend provides upload, moderation/processing, and stream endpoints exactly as used by the frontend.
- Backend emits Socket.IO progress updates per video id.
- Browser `localStorage` is acceptable for token persistence in this assignment scope.

### Design decisions

- **Zustand for state**: chosen for lightweight global state with minimal boilerplate.
- **Axios interceptor auth**: central token injection and `401` handling avoids duplicated request logic.
- **Protected routes + page-level role checks**:
    - route-level token guard in `ProtectedRoute`
    - admin-only access additionally checked in `Admin` page
- **Optimistic-ish upload UX**: newly uploaded video is prepended to list immediately from upload response.
- **Real-time progress**: Socket.IO subscriptions update cards without polling.
- **Safe-only playback**: player blocks non-safe content by design, matching moderation goals.

### Known limitations

- Role checks are partly client-side for UX; backend must still enforce authorization.
- Socket listeners are attached per processing item and rely on backend event naming convention.
- `window.location.href` redirect on `401` causes full page navigation instead of client router navigation.

## Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Troubleshooting

- **App always redirects to login**
    - Verify `VITE_API_URL` points to correct backend.
    - Ensure backend returns valid token on login/register.
- **No real-time progress updates**
    - Verify `VITE_SOCKET_URL` and Socket.IO server availability.
    - Confirm backend emits `progress:<videoId>` events.
- **Playback fails for safe video**
    - Check `/videos/:id/stream` endpoint and auth token validity.
