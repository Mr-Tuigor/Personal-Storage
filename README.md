# Personal Storage Hub

A full-stack, highly secure, and feature-rich personal cloud storage application. Built with a modern tech stack, it provides an all-in-one workspace for managing your files, photos, music, notes, and sensitive passwords.

![Dashboard Preview](https://via.placeholder.com/1000x500.png?text=Personal+Storage+Hub)

## 🌟 Features

- **📂 File Manager**: Upload, organize, and preview your documents in the browser. Supports creating folders and direct-to-R2 uploads for maximum performance.
- **🖼️ Photo Gallery**: Organize your memories into albums. Fast uploads and a beautiful masonry-style viewing experience.
- **🎵 Music Player**: Your personal streaming service. Upload albums, listen with a persistent global player, and enjoy features like Shuffle, Loop (All/One), and background playback.
- **📝 Rich Notes**: Create, edit, and organize formatted text notes with a beautiful floating editor.
- **🔐 Encrypted Vault**: A highly secure password manager. All vault items are **End-to-End Encrypted (AES-256-GCM)** using a server-side vault key before they ever touch the database.
- **📊 Dashboard Analytics**: Get a bird's-eye view of your storage utilization and quick links to jump directly to your content.

## 🏗️ Tech Stack

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context (PlayerContext, AuthContext)
- **Routing**: React Router v6
- **Icons**: React Icons (Heroicons & Boxicons)

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Storage Integration**: Cloudflare R2 (via `@aws-sdk/client-s3`)
- **Encryption**: Node `crypto` (AES-256-GCM)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or MongoDB Atlas)
- Cloudflare R2 Bucket (or AWS S3 compatible storage)

### Environment Setup

#### Server (`/server/.env`)
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personal_storage
JWT_SECRET=your_super_secret_jwt_key
VAULT_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=personal-storage
R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev
```

#### Client (`/client/.env`)
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 🛠️ Cloudflare R2 CORS Configuration
For Direct-to-R2 uploads to work from your browser, you must apply the following CORS policy to your R2 bucket via the Cloudflare Dashboard:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://localhost:5173"
    ],
    "AllowedMethods": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

### Installation & Running

1. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```
2. **Start the Server:**
   ```bash
   npm run dev
   ```

3. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```
4. **Start the Client:**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` in your browser to start using the app!

## 🔒 Security
- Passwords stored in the Vault are securely encrypted on the backend using `AES-256-GCM`. The raw passwords are never saved to the database in plain text.
- User authentication is handled securely via signed JWTs.
- Cloudflare R2 presigned URLs are securely generated and strictly scoped, ensuring only authorized users can upload to or download from their specific isolated paths within the bucket.
