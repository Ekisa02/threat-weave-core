import React, { useEffect, useState } from 'react';

type Alert = {
  id: string;
  severity: 'low'|'medium'|'high';
  source: string;
  reason: string;
  timestamp: string;
};

export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch('/api/alerts')
      .then(r => r.json())
      .then(setAlerts)
      .catch(() => setAlerts([]));
  }, []);

  return (
    <div style={{fontFamily: 'Inter, system-ui', padding: 20}}>
      <h1>Sentinel Weave — Alerts</h1>
      <p>Simple alert viewer. Built for demonstration; integrate with your SIEM/console for production.</p>
      <div>
        {alerts.length === 0 ? (
          <p>No alerts</p>
        ) : (
          <ul>
            {alerts.map(a => (
              <li key={a.id} style={{marginBottom: 10}}>
                <strong>[{a.severity}]</strong> <em>{a.source}</em> — {a.reason} <br/>
                <small>{new Date(a.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
