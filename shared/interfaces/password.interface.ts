export interface IPassword {
  _id: string;
  userId: string;
  accountName: string;
  accountUsername: string;
  encryptedPassword: string;
  iv: string;
  authTag: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPasswordCreatePayload {
  accountName: string;
  accountUsername: string;
  password: string;
  notes?: string;
}

export interface IPasswordUpdatePayload {
  accountName?: string;
  accountUsername?: string;
  password?: string;
  notes?: string;
}

/** What the client receives — plaintext password is decrypted server-side */
export interface IPasswordDecrypted {
  _id: string;
  userId: string;
  accountName: string;
  accountUsername: string;
  password: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
