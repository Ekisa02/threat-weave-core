import { Alert } from './types';
import { db } from './db';

// In-memory store (capped) plus optional DB persistence
class AlertStore {
  private alerts: Alert[] = [];
  private cap = 1000;

  add(alert: Alert) {
    this.alerts.unshift(alert);
    if (this.alerts.length > this.cap) this.alerts.pop();
    // best-effort persist
    db.saveAlert(alert).catch(() => undefined);
  }

  list(): Alert[] {
    return this.alerts.slice(0, 200);
  }
}

export const alertStore = new AlertStore();
