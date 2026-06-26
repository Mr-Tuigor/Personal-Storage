export interface IImageAlbum {
  _id: string;
  userId: string;
  albumName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IImage {
  _id: string;
  userId: string;
  albumId?: string;
  originalName: string;
  r2Key: string;
  r2Url: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IImageAlbumCreatePayload {
  albumName: string;
  description?: string;
}

export interface IImageAlbumWithCount extends IImageAlbum {
  imageCount: number;
  coverImage?: string;
}
