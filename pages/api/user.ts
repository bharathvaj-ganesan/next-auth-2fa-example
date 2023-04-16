import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { omit } from 'lodash';
import User, { IUser } from '../../models/User';
import { ErrorCode } from '../../utils/ErrorCode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!session.user?.email) {
    console.error('Session is missing a user id.');
    return res.status(500).json({ error: ErrorCode.InternalServerError });
  }

  const user = await User.findOne<IUser>({ email: session.user.email });

  if (!user) {
    console.error(`Session references user that no longer exists.`);
    return res.status(401).json({ message: 'Not authenticated' });
  }

  return res.json(omit(user, 'twoFactorSecret', 'password'));
}
