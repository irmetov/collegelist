import { NextApiRequest, NextApiResponse } from 'next';
import { fetchCollegeData } from '../../firebase-admin-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const colleges = await fetchCollegeData();
      res.status(200).json(colleges);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch college data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
