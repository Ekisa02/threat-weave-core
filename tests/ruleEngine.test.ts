import { matchRules } from '../src/lib/detectors/ruleEngine';

test('rule engine matches known patterns', () => {
  const evt = { id: '1', source: 'app', timestamp: new Date().toISOString(), message: 'Failed login for admin from 1.2.3.4', meta: { ip: '1.2.3.4' } } as any;
  const alerts = matchRules(evt);
  expect(alerts.length).toBeGreaterThanOrEqual(1);
  expect(alerts[0].reason).toMatch(/Rule matched/);
});
