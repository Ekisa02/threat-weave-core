import { Pool } from 'pg';
import { Alert } from './types';

const databaseUrl = process.env.DATABASE_URL;
let pool: Pool | null = null;

if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl });
  // Simple table creation (idempotent)
  pool.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      source TEXT,
      severity TEXT,
      reason TEXT,
      timestamp TIMESTAMPTZ,
      data JSONB
    );
  `).catch((err) => console.error('Failed to ensure alerts table', err));
}

export const db = {
  async saveAlert(alert: Alert) {
    if (!pool) return;
    await pool.query(
      `INSERT INTO alerts (id, event_id, source, severity, reason, timestamp, data)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO NOTHING;`,
      [alert.id, alert.eventId || null, alert.source, alert.severity, alert.reason, alert.timestamp, alert.data || {}]
    );
  },
  async listAlerts(): Promise<Alert[]> {
    if (!pool) return [];
    const res = await pool.query('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 100;');
    return res.rows.map(r => ({
      id: r.id,
      eventId: r.event_id,
      source: r.source,
      severity: r.severity,
      reason: r.reason,
      timestamp: r.timestamp.toISOString(),
      data: r.data
    }));
  }
};
