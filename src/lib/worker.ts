import { drainQueue } from './ingest';
import { matchRules } from './detectors/ruleEngine';
import { anomalyDetector } from './detectors/anomalyDetector';
import { alertStore } from './alertStore';
import { logger } from './logger';

// Background worker: periodically drain queue and run detectors

const POLL_MS = 2000;
let running = false;

async function processBatch() {
  const batch = drainQueue(200);
  if (batch.length === 0) return;

  for (const ev of batch) {
    try {
      // rule-based
      const ruleAlerts = matchRules(ev);
      for (const a of ruleAlerts) alertStore.add(a);

      // anomaly
      const anomalyAlerts = anomalyDetector.ingest(ev);
      for (const a of anomalyAlerts) alertStore.add(a);
    } catch (err) {
      logger.error({ err, eventId: ev.id }, 'Failed to process event');
    }
  }
}

export function startWorker() {
  if (running) return;
  running = true;
  setInterval(() => {
    processBatch().catch(err => logger.error({ err }, 'Worker error'));
  }, POLL_MS);
}

// start worker eagerly when module loaded (Next.js server will load this in API route environment)
startWorker();
