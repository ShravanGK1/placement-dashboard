# Distributed Systems & Advanced Communication Integration Plan

This plan outlines the implementation of core Distributed Systems (DS) & Communication paradigms within the **Placement Cell Dashboard** project.

## Overview of Added Paradigms

1. **Middleware Layer (`middleware.ts` & API Decorators)**:
   - Next.js Edge Middleware for authentication, route protection (`/admin`, `/student`, `/recruiter`, `/ds-demo`), CORS, request tracing (`X-Request-Id`), and execution timing.
   - Custom API Middleware wrappers: `withAuth`, `withRateLimit`, `withFaultTolerance`, `withLogging`.

2. **Client ↔ Server ↔ Database Communication Pipeline**:
   - Clean DTO interfaces, query optimization, connection pooling resilience, and standardized HTTP response wrappers (`{ success, data, error, metadata }`).

3. **RPC (Remote Procedure Call)**:
   - JSON-RPC 2.0 compliant endpoint (`/api/ds/rpc`) supporting single & batch method calls (e.g. `placement.getStats`, `application.submit`, `system.ping`).
   - Full RPC client library in `lib/ds/rpc-client.ts`.

4. **Message-Oriented Communication (Message Broker / Pub-Sub)**:
   - In-memory asynchronous Message Queue & Publisher/Subscriber event broker (`lib/ds/message-broker.ts`).
   - Topics for `job.posted`, `application.status_changed`, `notification.broadcast`.
   - Support for Consumer Groups and Dead Letter Queue (DLQ).

5. **Stream-Oriented Communication (Server-Sent Events)**:
   - SSE endpoint (`/api/ds/stream`) delivering real-time streaming placement tickers, server metrics, and live event updates using HTTP Chunked Transfer & `text/event-stream`.

6. **P2P Messaging & WebRTC**:
   - WebRTC Peer-to-Peer audio/video call & P2P `RTCDataChannel` chat tool for student mock interviews & peer resume/notes sharing.
   - WebRTC Signaling API (`/api/ds/webrtc/signal`) for SDP Offer/Answer and ICE Candidate exchange.

7. **Fault Tolerance & Resiliency**:
   - **Circuit Breaker** (CLOSED, OPEN, HALF-OPEN states with automatic fallback).
   - **Retry Mechanism** with Exponential Backoff & Random Jitter.
   - **Rate Limiting** (Token Bucket / Sliding Window).
   - **Health Check & Service Telemetry Probe** (`/api/ds/health`).

8. **Interactive Distributed Systems Showcase Dashboard (`/ds-demo`)**:
   - Dedicated UI dashboard with interactive control panels and real-time visualizers for each DS paradigm.

---

## User Review Required

> [!IMPORTANT]
> The features will be implemented as modular extensions into the existing Next.js app without disrupting current authentication or database schema. A new dedicated navigation section and route (`/ds-demo`) will be added to test and demonstrate all 7 concepts visually.

---

## Proposed Changes

### 1. Middleware Infrastructure
#### [NEW] [middleware.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/middleware.ts)
- Next.js edge middleware handling JWT validation, path authorization, request ID correlation, latency tracking headers, and security headers.

#### [NEW] [lib/middleware/api-middleware.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/lib/middleware/api-middleware.ts)
- Reusable API route handler wrappers (`withAuth`, `withRateLimit`, `withFaultTolerance`, `withLogging`).

---

### 2. Distributed Systems Core Modules (`lib/ds/`)
#### [NEW] [lib/ds/rpc.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/lib/ds/rpc.ts)
- JSON-RPC 2.0 handler, method registry, batch executor, and error formatter.

#### [NEW] [lib/ds/message-broker.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/lib/ds/message-broker.ts)
- Pub/Sub broker, topic channels, event queues, subscriber listeners, and DLQ handling.

#### [NEW] [lib/ds/fault-tolerance.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/lib/ds/fault-tolerance.ts)
- Circuit Breaker class, Retry executor with exponential backoff, Rate Limiter (Token Bucket), Fallback execution wrappers.

#### [NEW] [lib/ds/webrtc-signaling.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/lib/ds/webrtc-signaling.ts)
- In-memory room signaling store for WebRTC connection negotiation.

---

### 3. API Endpoints (`app/api/ds/`)
#### [NEW] [app/api/ds/rpc/route.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/rpc/route.ts)
- Endpoint for JSON-RPC 2.0 calls.

#### [NEW] [app/api/ds/messages/route.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/messages/route.ts)
- Endpoint to publish/subscribe/fetch queue status for message-oriented communication.

#### [NEW] [app/api/ds/stream/route.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/stream/route.ts)
- SSE route returning `text/event-stream` for live streaming stats and telemetry.

#### [NEW] [app/api/ds/webrtc/signal/route.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/webrtc/signal/route.ts)
- WebRTC signaling endpoint (POST SDP offer/answer/ICE candidates, GET room signals).

#### [NEW] [app/api/ds/health/route.ts](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/api/ds/health/route.ts)
- Comprehensive system telemetry, DB latency probe, circuit breaker statuses, and node health.

---

### 4. Frontend Interactive UI (`app/ds-demo/` & Components)
#### [NEW] [app/ds-demo/page.tsx](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/app/ds-demo/page.tsx)
- Full interactive Distributed Systems Showcase Page featuring tabbed sub-modules:
  1. Middleware & Request Tracing Inspector
  2. JSON-RPC 2.0 Test Workbench
  3. Message Broker & Event Queue Visualizer
  4. Real-time SSE Stream Ticker
  5. P2P WebRTC Mock Interview & DataChannel Tool
  6. Fault Tolerance & Circuit Breaker Simulator

#### [NEW] [components/ds/rpc-workbench.tsx](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/rpc-workbench.tsx)
#### [NEW] [components/ds/message-queue-visualizer.tsx](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/message-queue-visualizer.tsx)
#### [NEW] [components/ds/stream-visualizer.tsx](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/stream-visualizer.tsx)
#### [NEW] [components/ds/p2p-webrtc-room.tsx](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/p2p-webrtc-room.tsx)
#### [NEW] [components/ds/fault-tolerance-controls.tsx](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/fault-tolerance-controls.tsx)
#### [NEW] [components/ds/middleware-inspector.tsx](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/components/ds/middleware-inspector.tsx)

---

### 5. Project Documentation
#### [MODIFY] [README.md](file:///c:/Users/Shravan%20Joshi/OneDrive/Desktop/placement-cell-dashboard-main/README.md)
- Update README to document all implemented Distributed Systems communication & middleware concepts, APIs, and demo usage instructions.

---

## Verification Plan

### Automated / Build Verification
- Run `npm run build` or `npx tsc --noEmit` to verify type safety across all new modules.

### Manual Verification
- Access `http://localhost:3000/ds-demo` in browser:
  - Test Next.js Middleware request headers & route checks.
  - Execute JSON-RPC calls (single & batch) and verify JSON-RPC 2.0 payload compliance.
  - Publish events to Pub/Sub message broker and observe consumer queues & dead-letter queue behavior.
  - Connect to SSE stream and observe live ticker updates & heartbeat metrics.
  - Open two browser windows on `/ds-demo` WebRTC tab, initiate peer room connection, establish WebRTC video/audio call & P2P DataChannel chat.
  - Simulate server failures in Fault Tolerance tab to trigger Circuit Breaker (CLOSED -> OPEN -> HALF-OPEN) and witness automatic Retry backoff & Fallback responses.
