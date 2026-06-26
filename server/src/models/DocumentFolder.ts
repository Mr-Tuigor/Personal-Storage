import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentFolder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  folderName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentFolderSchema = new Schema<IDocumentFolder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    folderName: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [50, 'Folder name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

documentFolderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v: _, ...rest } = ret;
    return rest;
  },
});

export const DocumentFolder = mongoose.model<IDocumentFolder>('DocumentFolder', documentFolderSchema);
