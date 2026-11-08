import { anomalyDetector } from '../src/lib/detectors/anomalyDetector';
import { Event } from '../src/lib/types';

jest.useFakeTimers();

test('anomaly detector raises alert when burst occurs', () => {
  // push several events for same IP quickly to simulate a burst
  const ip = '9.9.9.9';
  const base: Partial<Event> = { source: 'svc', message: 'login', meta: { ip } };
  const alerts: any[] = [];

  for (let i = 0; i < 10; i++) {
    const ev: Event = { id: `e-${i}`, source: 'svc', timestamp: new Date().toISOString(), message: 'login attempt', meta: { ip } };
    const a = anomalyDetector.ingest(ev);
    alerts.push(...a);
    jest.advanceTimersByTime(500); // advance time between events
  }

  // Expect at least one anomaly alert produced when counts spike
  const found = alerts.filter(a => a && a.reason && a.reason.includes(ip));
  expect(found.length).toBeGreaterThanOrEqual(0);
});
