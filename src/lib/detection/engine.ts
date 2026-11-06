import { EventPayload, Alert } from '@/lib/types'
import { MemoryStore } from '@/lib/store/memory'
import { evaluateRule } from '@/lib/detection/rules'

// Simple running stats per metric for z-score anomaly detection
class RunningStat {
  n = 0
  mean = 0
  m2 = 0

  update(x: number) {
    this.n += 1
    const delta = x - this.mean
    this.mean += delta / this.n
    const delta2 = x - this.mean
    this.m2 += delta * delta2
  }

  variance() {
    return this.n > 1 ? this.m2 / (this.n - 1) : 0
  }

  stddev() {
    return Math.sqrt(this.variance())
  }
}

export class DetectionEngine {
  store: MemoryStore
  // metrics map -> RunningStat
  private stats: Map<string, RunningStat> = new Map()

  anomalyZThreshold = 3 // z-score threshold for anomalous

  constructor(store: MemoryStore) {
    this.store = store
  }

  async processEvent(event: EventPayload) {
    // persist event
    await this.store.addEvent(event)

    const alerts: Alert[] = []

    // Evaluate rules from store
    const rules = await this.store.listRules()
    for (const r of rules) {
      const a = evaluateRule(r, event)
      if (a) {
        await this.store.addAlert(a)
        alerts.push(a)
      }
    }

    // Run anomaly detection on numeric metrics
    if (event.metrics) {
      for (const [metric, val] of Object.entries(event.metrics)) {
        const stat = this.stats.get(metric) ?? new RunningStat()
        // compute z-score before updating stats to avoid self-influence
        const std = stat.stddev()
        const z = std > 0 ? (val - stat.mean) / std : 0
        if (Math.abs(z) >= this.anomalyZThreshold) {
          const anomaly: Alert = {
            id: `anomaly-${Date.now()}-${metric}`,
            eventId: event.id,
            severity: Math.abs(z) > 5 ? 'high' : 'medium',
            reason: `Anomalous metric ${metric} (z=${z.toFixed(2)}, value=${val})`,
            metadata: { metric, z },
            createdAt: new Date().toISOString()
          }
          await this.store.addAlert(anomaly)
          alerts.push(anomaly)
        }
        stat.update(val)
        this.stats.set(metric, stat)
      }
    }

    return alerts
  }
}
