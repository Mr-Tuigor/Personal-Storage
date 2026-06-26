export interface IDocument {
  _id: string;
  userId: string;
  originalName: string;
  r2Key: string;
  r2Url: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentUploadResponse {
  _id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  r2Url: string;
  createdAt: Date;
}
