import { Event, Rule, Alert } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Example default ruleset; in production load from DB or config files
const defaultRules: Rule[] = [
  {
    id: 'rule-1',
    name: 'Failed admin login',
    description: 'Detect failed admin logins',
    severity: 'medium',
    pattern: 'failed login.*admin'
  },
  {
    id: 'rule-2',
    name: 'SQL injection attempt',
    description: 'Potential SQL injection signatures',
    severity: 'high',
    pattern: "(union select|or 1=1|' or '1'='1)",
  }
];

export function matchRules(event: Event, rules: Rule[] = defaultRules): Alert[] {
  const found: Alert[] = [];
  const message = (event.message || '').toLowerCase();
  for (const r of rules) {
    try {
      const re = new RegExp(r.pattern, 'i');
      if (re.test(message)) {
        found.push({
          id: uuidv4(),
          eventId: event.id,
          source: event.source,
          severity: r.severity,
          reason: `Rule matched: ${r.name}`,
          timestamp: new Date().toISOString(),
          data: { ruleId: r.id, ruleName: r.name }
        });
      }
    } catch (err) {
      // ignore invalid regexes
      continue;
    }
  }
  return found;
}
