import { type Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  discordId: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', userSchema);
