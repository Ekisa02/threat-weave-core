import { Event } from './types';

// Very small in-memory queue. In production, replace with durable queue.
const queue: Event[] = [];

export function queueEvent(event: Event) {
  queue.push(event);
}

export function drainQueue(max = 100): Event[] {
  if (queue.length === 0) return [];
  const items = queue.splice(0, max);
  return items;
}

export function queueSize() {
  return queue.length;
}
