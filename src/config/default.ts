import { Rule } from '@/lib/types'

export const DEFAULT_RULES: Rule[] = [
  {
    id: 'rule-1',
    name: 'Failed login regex',
    condition: 'regex',
    pattern: 'failed login|invalid password|authentication failed',
    severity: 'medium',
    enabled: true
  },
  {
    id: 'rule-2',
    name: 'High login failures',
    condition: 'metric_threshold',
    metric: 'login_failures',
    threshold: 5,
    severity: 'medium',
    enabled: true
  }
]
