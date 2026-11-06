import { MemoryStore } from '@/lib/store/memory'
import { DetectionEngine } from '@/lib/detection/engine'
import { DEFAULT_RULES } from '@/config/default'

describe('DetectionEngine', () => {
  test('generates alert for regex rule match', async () => {
    const store = new MemoryStore(DEFAULT_RULES)
    const engine = new DetectionEngine(store)

    const evt = {
      id: 'evt-1',
      source: 'testbox',
      timestamp: new Date().toISOString(),
      message: 'User reported: Failed login for user root',
      metrics: { login_failures: 1 }
    }

    const alerts = await engine.processEvent(evt)
    expect(alerts.length).toBeGreaterThanOrEqual(1)
    const hasRegexAlert = alerts.some(a => a.reason.includes('Pattern matched'))
    expect(hasRegexAlert).toBeTruthy()
  })

  test('generates anomaly alert for metric spike', async () => {
    const store = new MemoryStore(DEFAULT_RULES)
    const engine = new DetectionEngine(store)

    // Warm stats with low values
    for (let i = 0; i < 10; i++) {
      await engine.processEvent({
        id: `warm-${i}`,
        source: 'sensor',
        timestamp: new Date().toISOString(),
        message: 'warmup',
        metrics: { requests: 10 }
      })
    }

    // Spike that should be anomalous
    const spike = {
      id: 'spike-1',
      source: 'sensor',
      timestamp: new Date().toISOString(),
      message: 'sudden spike',
      metrics: { requests: 1000 }
    }

    const alerts = await engine.processEvent(spike)
    const anomaly = alerts.find(a => a.reason.includes('Anomalous metric'))
    expect(anomaly).toBeDefined()
  })
})
