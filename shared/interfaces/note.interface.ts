export interface INote {
  _id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteCreatePayload {
  title: string;
  content?: string;
  tags?: string[];
}

export interface INoteUpdatePayload {
  title?: string;
  content?: string;
  tags?: string[];
}
