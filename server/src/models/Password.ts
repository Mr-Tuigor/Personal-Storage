import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  accountName: string;
  accountUsername: string;
  encryptedPassword: string;
  iv: string;
  authTag: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const passwordSchema = new Schema<IPasswordDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    accountUsername: {
      type: String,
      required: [true, 'Account username is required'],
      trim: true,
    },
    encryptedPassword: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    authTag: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Remove internal fields from JSON output
passwordSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v: _, ...rest } = ret;
    return rest;
  },
});

export const Password = mongoose.model<IPasswordDocument>('Password', passwordSchema);
