import type { NextApiRequest, NextApiResponse } from 'next'
import { MemoryStore } from '@/lib/store/memory'
import { DetectionEngine } from '@/lib/detection/engine'
import { DEFAULT_RULES } from '@/config/default'
import { logInfo, logError } from '@/utils/logger'

// NOTE: For this sample, we use a module-scoped singleton store & engine.
// In production use you should wire dependencies via DI and use persistent storage.
const store = new MemoryStore(DEFAULT_RULES)
const engine = new DetectionEngine(store)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const event = req.body
  if (!event || !event.id || !event.message) {
    return res.status(400).json({ error: 'Invalid event payload (requires id, message)' })
  }

  try {
    logInfo('Ingest received', { id: event.id })
    const alerts = await engine.processEvent(event)
    return res.status(200).json({ ingested: event.id, alerts })
  } catch (err) {
    logError('Error processing event', err)
    return res.status(500).json({ error: 'internal' })
  }
}
