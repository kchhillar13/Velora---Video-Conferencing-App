# Velora — Video Conferencing Platform

A modern, scalable video conferencing application built with WebRTC, Next.js, and TypeScript.

![Architecture](Diagrams/sequenceDiagram.png)

## 🏗️ Architecture

```
velora/
├── Diagrams/       # System design diagrams (UML, ERD, Sequence, Use Case)
├── backend/        # Express + Socket.io signaling server
├── frontend/       # Next.js 16 + Tailwind CSS client
└── README.md       # You are here
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| **Backend** | Node.js, Express, Socket.io, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Clerk (SSO, JWT) |
| **Video** | Native WebRTC (P2P mesh topology) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+ and npm
- **PostgreSQL** v14+ (local or cloud)
- **Clerk Account** — [clerk.com](https://clerk.com) for authentication keys

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/velora---video-conferencing-app.git
cd velora---video-conferencing-app
```

### 2. Set Up PostgreSQL

**Option A: Local PostgreSQL**

```bash
# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16
createdb velora
```

**Option B: Cloud Database (Neon/Supabase/Railway)**

Create a PostgreSQL database and note the connection URL.

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and Clerk keys

# Generate Prisma client
npx prisma generate

# Push database schema (creates tables)
npx prisma db push

# Start development server (port 4000)
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables (already has defaults)
# Edit .env.local if needed

# Start development server (port 3000)
npm run dev
```

### 5. Open the App

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Sign in with Clerk
3. Create a meeting → copy the link → open in another tab → join!

---

## 📋 Environment Variables

### Backend (`/backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/velora` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |

### Frontend (`/frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key (for middleware) | `sk_test_...` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Backend WebSocket URL | `http://localhost:4000` |

---

## 📁 Project Structure

### Backend

```
backend/src/
├── index.ts                 # Express + Socket.io entry point
├── config/                  # Database, CORS, env configuration
├── middleware/               # Auth (Clerk JWT), error handling, validation
├── routes/                  # REST API routes
├── controllers/             # Request handlers
├── services/                # Business logic layer
├── signaling/               # WebRTC signaling server
│   ├── socket-server.ts     # Socket.io singleton
│   ├── room-manager.ts      # Room state (Observer pattern)
│   └── handlers/            # Socket event handlers
├── patterns/                # Design patterns (Factory, Singleton)
├── types/                   # TypeScript type definitions
└── utils/                   # Logger, ID generator
```

### Frontend

```
frontend/
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Sign in/up pages
│   ├── (root)/              # Dashboard pages
│   └── meeting/[id]/        # Video room page
├── components/              # React components
│   ├── VideoTile.tsx        # Video stream renderer
│   ├── MeetingRoom.tsx      # Full meeting room UI
│   ├── MeetingSetup.tsx     # Pre-join camera preview
│   ├── MediaControls.tsx    # Mic/cam/share controls
│   └── ParticipantList.tsx  # Participant sidebar
├── hooks/                   # Custom React hooks
│   ├── useWebRTC.ts         # WebRTC peer connections
│   ├── useSocket.ts         # Socket.io client
│   └── useMediaStream.ts   # Camera/mic access
├── store/                   # Zustand state store
└── lib/                     # API client, utilities
```

---

## 🎨 Design Patterns

| Pattern | Usage |
|---------|-------|
| **Singleton** | `DatabaseClient` — single Prisma connection pool |
| **Singleton** | `SocketServer` — single Socket.io instance |
| **Observer** | `RoomManager` — notifies peers of join/leave events |
| **Factory** | `MeetingFactory` — creates different meeting types |
| **Strategy** | `AuthStrategy` — swappable auth mechanisms |

---

## 🔌 API Reference

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/users/sync` | Sync user from Clerk |
| `GET` | `/api/users/me` | Get current user |
| `POST` | `/api/meetings` | Create meeting |
| `GET` | `/api/meetings` | List user meetings |
| `GET` | `/api/meetings/:code` | Get meeting by code |
| `PATCH` | `/api/meetings/:id/status` | Update meeting status |

### WebSocket Events

| Direction | Event | Description |
|-----------|-------|-------------|
| C→S | `join-room` | Join a meeting room |
| C→S | `leave-room` | Leave a meeting room |
| C→S | `offer` | Send WebRTC offer |
| C→S | `answer` | Send WebRTC answer |
| C→S | `ice-candidate` | Send ICE candidate |
| S→C | `room-users` | Existing room participants |
| S→C | `user-joined` | New peer joined |
| S→C | `user-left` | Peer left |

---

## 📊 Diagrams

The project was designed using standard system design principles. Below are the key architectural diagrams:

### 1. Use Case Diagram
Describes the actor-action mapping and features available to users.
![Use Case Diagram](Diagrams/useCaseDiagran.png)

### 2. ER Diagram (Entity-Relationship)
Represents the database schema and relations for meetings and participants.
![ER Diagram](Diagrams/erdiagram.jpeg)

### 3. Sequence Diagram
Demonstrates the WebRTC signaling flow and client-server interactions.
![Sequence Diagram](Diagrams/sequenceDiagram.png)

### 4. Class Diagram
Outlines the design patterns and SOLID principles applied in the backend (e.g. Singleton, Observer, Factory).
![Class Diagram](Diagrams/class_diagram.png)

---

## 🧪 Development

```bash
# Backend type checking
cd backend && npm run typecheck

# Frontend type checking
cd frontend && npm run typecheck

# Database GUI
cd backend && npx prisma studio
```

---

## 📝 License

MIT
