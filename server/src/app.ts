import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import passwordRoutes from './routes/password.routes';
import documentRoutes from './routes/document.routes';
import imageRoutes from './routes/image.routes';
import musicRoutes from './routes/music.routes';
import noteRoutes from './routes/note.routes';

const app = express();

// Trust reverse proxy (required for Render/Heroku and express-rate-limit)
app.set('trust proxy', 1);

// ─── Core Middleware ─────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limiter for all API routes
app.use('/api', apiLimiter);

// ─── API Routes ──────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/notes', noteRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// ─── Error Handling ──────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────

const PORT = parseInt(env.PORT, 10);

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
