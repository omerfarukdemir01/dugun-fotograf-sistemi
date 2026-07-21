import mongoose, { Schema, Document } from "mongoose";

export interface ILoginAttempt extends Document {
  ip: string;
  attempts: number;
  createdAt: Date;
}

const LoginAttemptSchema: Schema = new Schema({
  ip: { type: String, required: true, unique: true },
  attempts: { type: Number, required: true, default: 1 },
  // TTL Index: 60 saniye (1 dakika) sonra bu döküman veritabanından OTOMATİK silinir!
  createdAt: { type: Date, default: Date.now, expires: 60 },
});

export default mongoose.models.LoginAttempt ||
  mongoose.model<ILoginAttempt>("LoginAttempt", LoginAttemptSchema);