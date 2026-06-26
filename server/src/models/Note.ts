import mongoose, { Schema, Document } from 'mongoose';

export interface INoteDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INoteDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search on title and content
noteSchema.index({ title: 'text', content: 'text' });

noteSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v: _, ...rest } = ret;
    return rest;
  },
});

export const Note = mongoose.model<INoteDocument>('Note', noteSchema);
