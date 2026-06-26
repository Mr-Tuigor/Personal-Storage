import mongoose, { Schema, Document } from 'mongoose';

export interface IMusicAlbumDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  albumName: string;
  artist: string;
  createdAt: Date;
  updatedAt: Date;
}

const musicAlbumSchema = new Schema<IMusicAlbumDocument>(
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
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

musicAlbumSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v: _, ...rest } = ret;
    return rest;
  },
});

export const MusicAlbum = mongoose.model<IMusicAlbumDocument>('MusicAlbum', musicAlbumSchema);
