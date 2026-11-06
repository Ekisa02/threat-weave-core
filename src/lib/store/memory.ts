import { EventPayload, Alert, Rule } from '@/lib/types'

export class MemoryStore {
  private events: EventPayload[] = []
  private alerts: Alert[] = []
  private rules: Rule[] = []

  constructor(initialRules: Rule[] = []) {
    this.rules = initialRules.slice()
  }

  async addEvent(evt: EventPayload) {
    this.events.push(evt)
    return evt
  }

  async listEvents(limit = 100) {
    return this.events.slice(-limit)
  }

  async addAlert(alert: Alert) {
    this.alerts.push(alert)
    return alert
  }

  async listAlerts(limit = 100) {
    return this.alerts.slice(-limit)
  }

  async listRules() {
    return this.rules.slice()
  }

  async addRule(rule: Rule) {
    this.rules.push(rule)
    return rule
  }
}
