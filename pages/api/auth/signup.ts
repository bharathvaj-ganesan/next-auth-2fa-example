import { NextApiRequest, NextApiResponse } from 'next';
import User from '../../../models/User';
import db from '../../../utils/db';
import { hashPassword } from '../../../utils/hash';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const newUser = req.body;

    await db.connect();

    // Check if user exists
    const userExists = await User.findOne({ email: newUser.email });
    if (userExists) {
      res.status(422).json({
        success: false,
        message: 'A user with the same email already exists!',
        userExists: true,
      });
      return;
    }

    // Hash Password
    newUser.password = await hashPassword(newUser.password);

    // Store new user
    const storeUser = new User(newUser);
    await storeUser.save();

    res
      .status(201)
      .json({ success: true, message: 'User signed up successfuly' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid method' });
  }
}
