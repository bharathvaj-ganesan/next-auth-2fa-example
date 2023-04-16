import mongoose from 'mongoose';

interface IToken {
  userId: mongoose.Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}
const tokenSchema = new mongoose.Schema<IToken>({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Exprire in 5 mins
});

const Token =
  mongoose.models.Token || mongoose.model<IToken>('Token', tokenSchema);
export default Token;
