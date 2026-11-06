import type { NextApiRequest, NextApiResponse } from 'next'
import { MemoryStore } from '@/lib/store/memory'
import { DEFAULT_RULES } from '@/config/default'

// Shared with ingest's in-memory store in a production app via DI; here we reinstantiate
// to keep the example self-contained. In real usage, both API handlers should share the same store instance.
// For demonstration, this file will use a singleton store on global to share across hot reloads.

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var __SENTINEL_STORE__: any
}

const store: MemoryStore = (global as any).__SENTINEL_STORE__ ||= new MemoryStore(DEFAULT_RULES)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const alerts = await store.listAlerts(200)
  return res.status(200).json({ count: alerts.length, alerts })
}
