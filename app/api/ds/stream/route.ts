import { broker, EventMessage } from '@/lib/ds/message-broker';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout;
  const unsubs: Array<() => void> = [];

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connected event
      controller.enqueue(encoder.encode('event: connected\ndata: {"status": "ok"}\n\n'));

      // Subscribe to broker topics for live notifications
      const topics = ['job.posted', 'application.status_changed', 'application.submitted'];
      topics.forEach((topic) => {
        const unsub = broker.subscribe(topic, (msg: EventMessage) => {
          try {
            const sseFormatted = `event: broker_event\ndata: ${JSON.stringify(msg)}\n\n`;
            controller.enqueue(encoder.encode(sseFormatted));
          } catch (e) {
            console.error('[SSE Stream] Failed to enqueue broker message:', e);
          }
        });
        unsubs.push(unsub);
      });

      // Send telemetry and placement metrics pulse every 4 seconds
      intervalId = setInterval(() => {
        const payload = {
          timestamp: new Date().toISOString(),
          metrics: {
            activeConnections: Math.floor(Math.random() * 20) + 5,
            cpuUsage: (Math.random() * 25 + 5).toFixed(1) + '%',
            memoryUsage: (Math.random() * 200 + 150).toFixed(0) + ' MB',
          },
          placements: {
            recentOffers: Math.floor(Math.random() * 3),
            activeDrives: 12,
          },
        };

        const message = `event: telemetry\ndata: ${JSON.stringify(payload)}\n\n`;

        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          clearInterval(intervalId);
        }
      }, 4000);
    },
    cancel() {
      clearInterval(intervalId);
      unsubs.forEach((unsub) => unsub());
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
