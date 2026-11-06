import { Rule, EventPayload, Alert } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export function evaluateRule(rule: Rule, event: EventPayload): Alert | null {
  if (!rule.enabled) return null
  try {
    if (rule.condition === 'regex' && rule.pattern) {
      const re = new RegExp(rule.pattern, 'i')
      if (re.test(event.message || '')) {
        return buildAlert(event, rule, `Pattern matched: ${rule.pattern}`)
      }
    }

    if (rule.condition === 'metric_threshold' && rule.metric && typeof rule.threshold === 'number') {
      const val = event.metrics?.[rule.metric] ?? 0
      if (val >= rule.threshold) {
        return buildAlert(event, rule, `Metric ${rule.metric} >= ${rule.threshold} (value=${val})`)
      }
    }
  } catch (err) {
    // If a rule throws, we prefer to skip it rather than crash the pipeline
    return null
  }
  return null
}

function buildAlert(event: EventPayload, rule: Rule, reason: string): Alert {
  return {
    id: uuidv4(),
    eventId: event.id,
    severity: rule.severity ?? 'low',
    reason: `Rule(${rule.id}): ${rule.name} — ${reason}`,
    metadata: { ruleId: rule.id },
    createdAt: new Date().toISOString()
  }
}
