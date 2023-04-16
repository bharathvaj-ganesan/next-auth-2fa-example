import { nanoid } from 'nanoid';
import { NextApiRequest, NextApiResponse } from 'next';
import Token from '../../models/Token';
import User from '../../models/User';
import db from '../../utils/db';
import { hashPassword } from '../../utils/hash';
import { transporter } from '../../utils/nodemailer';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const email = req.body;

    try {
      await db.connect();

      // Check for user existence
      const user = await User.findOne({ email: email });

      if (!user) {
        return res.status(422).json({ messge: "User doesn't exists!" });
      } else {
        const token = await Token.findOne({ userId: user._id });

        if (token) {
          await token.deleteOne();
        }

        // Create a token id
        const securedTokenId = nanoid(32);

        // Store token in DB
        await new Token({
          userId: user._id,
          token: securedTokenId,
          createdAt: Date.now(),
        }).save();

        // Link send to user's email for resetting
        const link = `${process.env.WEB_URI}/reset-password/${securedTokenId}`;

        await transporter.sendMail({
          from: process.env.EMAIL,
          to: user.email,
          subject: 'Reset Password',
          text: 'Reset Password Messsage',
          html: ` 
          <div>
             <h1>Follow the following link</h1>
              <p>Please follow 
                <a href="${link}"> this link </a> 
                to reset your password
                </p>
          </div> 
          `,
        });
      }
    } catch (error: any) {
      return res.status(400).send({ message: error.message });
    }

    // Success
    res.status(200).json({ success: true });
  } else if (req.method === 'PUT') {
    const { tokenId, password } = req.body;

    // Get token from DB
    const token = await Token.findOne({ token: tokenId });

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    // Return user
    const user = await User.findOne({ _id: token.userId });

    // Hash password before resetting
    const hashedPassword = await hashPassword(password);

    await User.updateOne(
      { _id: user._id },
      { password: hashedPassword },
      { new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password reset successufly',
      html: 'Password is successfuly reset',
    });

    // Delete token so it won't be used twice
    const deleteToken = await Token.deleteOne({ _id: token._id });

    if (!deleteToken) {
      res.status(403).end();
    }

    res
      .status(200)
      .json({ seccuess: true, message: 'Password is reset successfuly' });
  } else {
    res.status(400).json({ success: false, message: 'Bad request' });
  }
}
