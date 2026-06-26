// Augment Express Request to include userId from JWT auth middleware
declare namespace Express {
  interface Request {
    userId?: string;
  }
}
