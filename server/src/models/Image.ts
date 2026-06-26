import mongoose, { Schema, Document } from 'mongoose';

export interface IImageAlbumDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  albumName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const imageAlbumSchema = new Schema<IImageAlbumDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    albumName: {
      type: String,
      required: [true, 'Album name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

imageAlbumSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v: _, ...rest } = ret;
    return rest;
  },
});

export const ImageAlbum = mongoose.model<IImageAlbumDocument>('ImageAlbum', imageAlbumSchema);

// ─── Image Document ────────────────────────────────────────────────

export interface IImageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  albumId?: mongoose.Types.ObjectId;
  originalName: string;
  r2Key: string;
  r2Url: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IImageDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    albumId: {
      type: Schema.Types.ObjectId,
      ref: 'ImageAlbum',
      index: true,
      default: null,
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
    fileSize: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

imageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v: _, ...rest } = ret;
    return rest;
  },
});

export const Image = mongoose.model<IImageDocument>('Image', imageSchema);
