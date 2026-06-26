import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  folderId?: mongoose.Types.ObjectId;
  originalName: string;
  r2Key: string;
  r2Url: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocumentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'DocumentFolder',
      index: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    r2Key: {
      type: String,
      required: true,
    },
    r2Url: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v: _, ...rest } = ret;
    return rest;
  },
});

export const DocumentModel = mongoose.model<IDocumentDocument>('Document', documentSchema);
