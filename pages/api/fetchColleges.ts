import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const collegesRef = collection(db, 'colleges');
    const snapshot = await getDocs(collegesRef);
    const colleges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(colleges);
  } catch (err) {
    console.error('Error fetching colleges:', err);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
}
