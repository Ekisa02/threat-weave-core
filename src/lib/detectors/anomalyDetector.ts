import { Event, Alert } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Simple sliding-window per-key counter anomaly detector
// Tracks counts per ip over a rolling window (minute buckets) and triggers when z-score > threshold

type WindowBucket = { ts: number; counts: Map<string, number> };

class AnomalyDetector {
  private windowSize = 6; // buckets (e.g., 6 * 10s = 1 minute if bucketDuration=10s)
  private bucketDuration = 10000; // ms
  private buckets: WindowBucket[] = [];
  private lastBucket = 0;
  private zThreshold = 3.0;

  ingest(event: Event): Alert[] {
    const now = Date.now();
    const bucketKey = Math.floor(now / this.bucketDuration) * this.bucketDuration;
    if (this.lastBucket !== bucketKey) {
      this.buckets.unshift({ ts: bucketKey, counts: new Map<string, number>() });
      this.lastBucket = bucketKey;
      if (this.buckets.length > this.windowSize) this.buckets.pop();
    }

    const ip = (event.meta && (event.meta.ip || event.meta.src_ip)) || 'unknown';
    const top = this.buckets[0];
    top.counts.set(ip, (top.counts.get(ip) || 0) + 1);

    // compute statistics across buckets for this ip
    const vals: number[] = this.buckets.map(b => b.counts.get(ip) || 0);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const variance = vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vals.length;
    const std = Math.sqrt(variance) || 1;
    const current = vals[0];

    const z = (current - mean) / std;

    const alerts: Alert[] = [];
    if (z > this.zThreshold && current > 1) {
      alerts.push({
        id: uuidv4(),
        eventId: event.id,
        source: event.source,
        severity: 'high',
        reason: `Anomalous traffic from ${ip} (z=${z.toFixed(1)})`,
        timestamp: new Date().toISOString(),
        data: { ip, z, counts: vals }
      });
      // After alerting, you might want to reset or dampen counts for that ip in real systems
    }

    return alerts;
  }
}

export const anomalyDetector = new AnomalyDetector();
