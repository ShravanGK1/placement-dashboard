export type EventMessage = {
  id: string;
  topic: string;
  payload: any;
  timestamp: number;
};

type SubscriberCallback = (message: EventMessage) => void | Promise<void>;

class MessageBroker {
  private topics = new Map<string, SubscriberCallback[]>();
  private queues = new Map<string, EventMessage[]>();
  private dlq: EventMessage[] = []; // Dead Letter Queue

  // Subscribe to a topic
  subscribe(topic: string, callback: SubscriberCallback) {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }
    this.topics.get(topic)!.push(callback);
    return () => this.unsubscribe(topic, callback);
  }

  // Unsubscribe from a topic
  unsubscribe(topic: string, callback: SubscriberCallback) {
    if (this.topics.has(topic)) {
      const callbacks = this.topics.get(topic)!;
      this.topics.set(topic, callbacks.filter(cb => cb !== callback));
    }
  }

  // Publish a message to a topic
  async publish(topic: string, payload: any) {
    const message: EventMessage = {
      id: `msg_${crypto.randomUUID()}`,
      topic,
      payload,
      timestamp: Date.now(),
    };

    // Store in queue for history/visualization
    if (!this.queues.has(topic)) {
      this.queues.set(topic, []);
    }
    
    const queue = this.queues.get(topic)!;
    queue.push(message);
    
    // Keep only last 50 messages per topic
    if (queue.length > 50) {
      queue.shift();
    }

    const subscribers = this.topics.get(topic) || [];
    
    // Asynchronously notify subscribers
    for (const callback of subscribers) {
      try {
        await Promise.resolve(callback(message));
      } catch (error) {
        console.error(`[MessageBroker] Error in subscriber for topic ${topic}`, error);
        // Add to Dead Letter Queue
        this.dlq.push({
          ...message,
          payload: { originalPayload: message.payload, error: String(error) },
          topic: `dlq_${topic}`
        });
        
        if (this.dlq.length > 100) this.dlq.shift();
      }
    }

    return message.id;
  }

  getQueueStatus() {
    const status: Record<string, number> = {};
    for (const [topic, queue] of this.queues.entries()) {
      status[topic] = queue.length;
    }
    return {
      topics: status,
      dlqCount: this.dlq.length
    };
  }

  getRecentMessages(topic: string, count: number = 10) {
    return (this.queues.get(topic) || []).slice(-count);
  }

  getDLQ() {
    return this.dlq;
  }
}

// Global singleton instance
export const broker = new MessageBroker();
