import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { symmetricEncrypt } from '../../../../../utils/crypto';
import { getSession, signOut, useSession } from 'next-auth/react';
import { ErrorCode } from '../../../../../utils/ErrorCode';
import User, { IUser } from '../../../../../models/User';
import { isPasswordValid } from '../../../../../utils/hash';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!session.user?.email) {
    console.error('Session is missing a user email.');
    return res.status(500).json({ error: ErrorCode.InternalServerError });
  }

  const user = await User.findOne<IUser>({ email: session.user?.email });

  if (!user) {
    console.error(`Session references user that no longer exists.`);
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!user.password) {
    return res.status(400).json({ error: ErrorCode.UserMissingPassword });
  }

  if (user.twoFactorEnabled) {
    return res.status(400).json({ error: ErrorCode.TwoFactorAlreadyEnabled });
  }

  if (!process.env.ENCRYPTION_KEY) {
    console.error('Missing encryption key; cannot proceed with two factor setup.');
    return res.status(500).json({ error: ErrorCode.InternalServerError });
  }

  const isCorrectPassword = await isPasswordValid(req.body.password, user.password);

  if (!isCorrectPassword) {
    return res.status(400).json({ error: ErrorCode.IncorrectPassword });
  }

  // This generates a secret 32 characters in length. Do not modify the number of
  // bytes without updating the sanity checks in the enable and login endpoints.
  const secret = authenticator.generateSecret(20);

  await User.updateOne(
    { email: session.user?.email },
    {
      twoFactorEnabled: false,
      twoFactorSecret: symmetricEncrypt(secret, process.env.ENCRYPTION_KEY),
    }
  );

  const name = user.email;
  const keyUri = authenticator.keyuri(name, 'MyApp', secret);
  const dataUri = await qrcode.toDataURL(keyUri);

  return res.json({ secret, keyUri, dataUri });
}
