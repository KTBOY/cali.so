// utils/eventBus.ts
type EventHandler = (...args: unknown[]) => void;

class EventBus {
  private events: Record<string, EventHandler[]> = {};

  on(eventName: string, handler: EventHandler) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(handler);
  }

  off(eventName: string, handler: EventHandler) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(h => h !== handler);
    }
  }

  emit(eventName: string, ...args: unknown[]) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(handler => handler(...args));
    }
  }
}

export const eventBus = new EventBus();
