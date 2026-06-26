import mongoose, { Schema, Document } from 'mongoose';

export interface IMusicTrackDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  albumId: mongoose.Types.ObjectId;
  trackName: string;
  r2Key: string;
  r2Url: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const musicTrackSchema = new Schema<IMusicTrackDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    albumId: {
      type: Schema.Types.ObjectId,
      ref: 'MusicAlbum',
      required: true,
      index: true,
    },
    trackName: {
      type: String,
      required: [true, 'Track name is required'],
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
    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

musicTrackSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v: _, ...rest } = ret;
    return rest;
  },
});

export const MusicTrack = mongoose.model<IMusicTrackDocument>('MusicTrack', musicTrackSchema);
