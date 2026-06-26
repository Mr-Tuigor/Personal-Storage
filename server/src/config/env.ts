// import dotenv from 'dotenv';
// import { z } from 'zod';

// dotenv.config();

// const envSchema = z.object({
//   PORT: z.string().default('5000'),
//   NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

//   // MongoDB
//   MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

//   // JWT
//   JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
//   JWT_EXPIRES_IN: z.string().default('7d'),

//   // Vault encryption
//   VAULT_ENCRYPTION_KEY: z.string().length(64, 'VAULT_ENCRYPTION_KEY must be 64 hex characters (32 bytes)'),

//   // Cloudflare R2
//   R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),
//   R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
//   R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
//   R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required'),
//   R2_PUBLIC_URL: z.string().url('R2_PUBLIC_URL must be a valid URL'),

//   // CORS
//   CLIENT_URL: z.string().url().default('http://localhost:5173'),
// });

// const parsed = envSchema.safeParse(process.env);

// if (!parsed.success) {
//   console.error('❌ Invalid environment variables:');
//   console.error(parsed.error.flatten().fieldErrors);
//   process.exit(1);
// }

// export const env = parsed.data;


import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Vault encryption
  VAULT_ENCRYPTION_KEY: z.string().length(64, 'VAULT_ENCRYPTION_KEY must be 64 hex characters (32 bytes)'),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required'),
  R2_PUBLIC_URL: z.string().url('R2_PUBLIC_URL must be a valid URL'),

  // CORS
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
