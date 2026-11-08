import type { NextApiRequest, NextApiResponse } from 'next';
import { queueEvent } from '../../lib/ingest';
import { logger } from '../../lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const event = req.body;

  if (!event || !event.id) {
    res.status(400).json({ error: 'Invalid event payload: id required' });
    return;
  }

  try {
    queueEvent(event);
    logger.info({ eventId: event.id }, 'Event queued');
    res.status(202).json({ status: 'queued' });
  } catch (err) {
    logger.error({ err }, 'Failed to queue event');
    res.status(500).json({ error: 'Failed to queue event' });
  }
}
