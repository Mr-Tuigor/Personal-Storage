export interface ITrack {
  _id?: string;
  trackName: string;
  r2Key: string;
  r2Url: string;
  duration?: number;
}

export interface IMusicAlbum {
  _id: string;
  userId: string;
  albumName: string;
  artist: string;
  tracks: ITrack[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMusicAlbumCreatePayload {
  albumName: string;
  artist: string;
}

export interface IMusicAlbumUpdatePayload {
  albumName?: string;
  artist?: string;
}
