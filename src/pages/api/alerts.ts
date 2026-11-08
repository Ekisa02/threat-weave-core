import type { NextApiRequest, NextApiResponse } from 'next';
import { alertStore } from '../../lib/alertStore';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const alerts = alertStore.list();
  res.status(200).json(alerts);
}
