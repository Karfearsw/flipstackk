import { NextApiRequest, NextApiResponse } from 'next';
import { testDatabaseConnection } from '../../lib/database-test';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = await testDatabaseConnection();
  
  if (result.success) {
    return res.status(200).json({
      message: 'Database connection successful',
      userCount: result.userCount
    });
  } else {
    return res.status(500).json({
      error: 'Database connection failed',
      details: result.error
    });
  }
}