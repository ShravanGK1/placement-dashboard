export enum CircuitBreakerState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

export class CircuitBreaker {
  private state = CircuitBreakerState.CLOSED;
  private failureThreshold: number;
  private recoveryTimeout: number;
  private failureCount = 0;
  private nextAttempt = 0;

  constructor(failureThreshold = 3, recoveryTimeout = 10000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
  }

  async execute<T>(action: () => Promise<T>, fallback?: () => T | Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() > this.nextAttempt) {
        this.state = CircuitBreakerState.HALF_OPEN;
      } else {
        if (fallback) return fallback();
        throw new Error("Circuit Breaker is OPEN");
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitBreakerState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + this.recoveryTimeout;
    }
  }
  
  getState() {
    return {
      state: CircuitBreakerState[this.state],
      failures: this.failureCount,
      threshold: this.failureThreshold
    };
  }
}

// Exponential Backoff Retry with Jitter
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      
      // Exponential backoff with random jitter
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 200;
      
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  throw new Error("Retry failed");
}

// Simple Token Bucket Rate Limiter
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  
  constructor(private capacity: number, private refillRateMs: number) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryAcquire(): boolean {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillRateMs);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
}

// Global instances for demo
export const globalCircuitBreaker = new CircuitBreaker(3, 10000); // 3 failures, 10s timeout
