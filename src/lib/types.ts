export type ISOTimeString = string

export interface EventPayload {
  id: string
  source: string
  type?: string
  timestamp: ISOTimeString
  message: string
  metrics?: Record<string, number>
  [key: string]: any
}

export interface Alert {
  id: string
  eventId: string
  severity: 'low' | 'medium' | 'high'
  reason: string
  metadata?: Record<string, any>
  createdAt: ISOTimeString
}

export type RuleCondition = 'regex' | 'metric_threshold'

export interface Rule {
  id: string
  name: string
  condition: RuleCondition
  pattern?: string
  metric?: string
  threshold?: number
  severity?: 'low' | 'medium' | 'high'
  enabled?: boolean
}
