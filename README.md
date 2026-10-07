# Placement Cell Dashboard

A comprehensive dashboard for managing university placement cell activities, built with Next.js and MongoDB.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: MongoDB
- **Forms & Validation**: React Hook Form, Zod
- **Authentication**: JWT & bcryptjs

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory based on `.env.example`:
```env
# Example environment variables
MONGODB_URI=mongodb://localhost:27017/placement-cell
JWT_SECRET=your_secret_key_here
```

3. Seed the database (optional):
```bash
npm run seed:users
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure (Frontend & Backend Monorepo)

```
placement-cell-dashboard-main/
├── frontend/                     # Next.js 16 Client Portal & UI Engine
│   ├── app/                      # Student, Recruiter, Admin, DS Demo & Interview pages
│   ├── components/               # shadcn/ui and interactive DS Visualizers
│   ├── hooks/                    # Custom React state and event hooks
│   ├── lib/                      # Client utilities, models & edge authentication
│   ├── public/                   # Static assets & illustrations
│   └── styles/                   # Global CSS & Tailwind styling
│
├── backend/                      # Node.js / Express API & Distributed Systems Service
│   ├── src/
│   │   ├── config/               # Database connection (MongoDB)
│   │   ├── controllers/          # Business logic handlers
│   │   ├── routes/               # REST, Auth, Student, Recruiter & DS routes
│   │   ├── middleware/           # Auth guard, X-Request-Id tracing, Rate Limiter
│   │   ├── models/               # Schemas for Users, Students & Interviews
│   │   ├── lib/ds/               # Distributed Algorithms (RPC, Broker, WebRTC, Fault Tolerance)
│   │   └── server.js             # Express server entry point (Port 5000)
│   └── scripts/                  # DB Seeding and maintenance scripts
│
├── package.json                  # Root Monorepo orchestration scripts
└── README.md                     # Comprehensive project documentation
```

### Monorepo NPM Scripts

- `npm run dev` or `npm run dev:frontend` - Starts Next.js frontend dev server (port 3000)
- `npm run dev:backend` - Starts standalone Express backend (port 5000)
- `npm run seed:users` - Seeds default demo accounts in MongoDB
- `npm run build` - Builds production frontend bundle


## Distributed Systems & Advanced Communication

This project implements core distributed systems and networking concepts integrated directly into Next.js. You can interactively test and visualize all these mechanisms at the **`/ds-demo`** dashboard route.

### Architecture, Relevance & Implementation Map

| Distributed System Feature | Relevance to Placement Cell Dashboard | Implementation & File Locations |
| :--- | :--- | :--- |
| **Middleware & Request Tracing (`X-Request-Id`)** | **Request Observability & Auditing**: Assigns a unique correlation ID to every incoming HTTP request. Ensures full traceability across logs during high-concurrency placement drives when tracking application submissions, login attempts, and status updates. | • [`middleware.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/middleware.ts)<br>• [`components/ds/middleware-inspector.tsx`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/middleware-inspector.tsx) |
| **JSON-RPC 2.0** | **Batch & High-Efficiency RPC Calls**: Enables recruiters and admins to execute bulk actions (e.g., shortlisting 50 students simultaneously or querying multi-service metrics) in a single batched network payload, drastically reducing roundtrip latency. | • [`lib/ds/rpc.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/lib/ds/rpc.ts)<br>• [`app/api/ds/rpc/route.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/rpc/route.ts)<br>• [`components/ds/rpc-workbench.tsx`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/rpc-workbench.tsx) |
| **Pub/Sub Messaging & DLQ** | **Event-Driven Placement Notifications**: Decouples application state changes (e.g., `job.posted`, `application.status_changed`). Messages that fail processing are automatically routed to a Dead Letter Queue (DLQ) to ensure no critical student interview invite or status update is lost. | • [`lib/ds/message-broker.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/lib/ds/message-broker.ts)<br>• [`app/api/ds/messages/route.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/messages/route.ts)<br>• [`components/ds/message-queue-visualizer.tsx`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/message-queue-visualizer.tsx) |
| **Server-Sent Events (SSE)** | **Real-Time Dashboard Metrics**: Unidirectional server-to-client streaming for live placement analytics (e.g., live offer counts, drive activity feeds, placement statistics) without the overhead of continuous client polling. | • [`app/api/ds/stream/route.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/stream/route.ts)<br>• [`components/ds/stream-visualizer.tsx`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/stream-visualizer.tsx) |
| **WebRTC Peer-to-Peer** | **Fully Integrated Virtual Interview Rooms**: Facilitates direct P2P audio/video streaming and data channels for mock interviews. Includes a robust signaling mechanism with **Polite Peer Concurrency Handling** to prevent glare, clean peer tear-down via `navigator.sendBeacon`, hardware fallbacks using dynamic HTML5 canvas streams, and deep integration into the recruiter (`Schedule Meet`) and student portal (`Inbox`) workflows. | • [`lib/ds/webrtc-signaling.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/lib/ds/webrtc-signaling.ts)<br>• [`app/api/ds/webrtc/signal/route.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/webrtc/signal/route.ts)<br>• [`components/ds/p2p-webrtc-room.tsx`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/p2p-webrtc-room.tsx)<br>• [`app/interview/[roomId]/page.tsx`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/interview/%5BroomId%5D/page.tsx) |
| **Fault Tolerance & Resilience** | **Traffic Surge Protection & High Availability**: Combines Token-Bucket Rate Limiting to handle massive student traffic surges when major companies open applications, Circuit Breakers to fail fast if downstream services crash, and Exponential Backoff Retries to safely recover. | • [`lib/ds/fault-tolerance.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/lib/ds/fault-tolerance.ts)<br>• [`app/api/ds/health/route.ts`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/health/route.ts)<br>• [`components/ds/fault-tolerance-controls.tsx`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/fault-tolerance-controls.tsx) |
| **Interactive DS Workbench** | **Live System Visualization**: Centralized page (`/ds-demo`) allowing admins/developers to inspect, simulate failures, monitor event queues, and test RPC/WebRTC signaling interactively. | • [`app/ds-demo/page.tsx`](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/ds-demo/page.tsx) |

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production server
- `npm run lint` - Runs ESLint to check for code issues
- `npm run seed:users` - Seeds the database with initial user data

## License

This project is licensed under the MIT License.
