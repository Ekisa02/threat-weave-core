import type { NextApiRequest, NextApiResponse } from 'next'
import { MemoryStore } from '@/lib/store/memory'
import { DEFAULT_RULES } from '@/config/default'

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var __SENTINEL_STORE__: any
}
const store: MemoryStore = (global as any).__SENTINEL_STORE__ ||= new MemoryStore(DEFAULT_RULES)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const rules = await store.listRules()
    return res.status(200).json({ count: rules.length, rules })
  }

  if (req.method === 'POST') {
    const rule = req.body
    if (!rule || !rule.id) {
      return res.status(400).json({ error: 'Invalid rule. Provide an id.' })
    }
    const added = await store.addRule(rule)
    return res.status(201).json({ rule: added })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
