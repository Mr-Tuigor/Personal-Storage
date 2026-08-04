import { Router } from 'express';
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getPresignedTrackData,
  createTrack,
  deleteTrack,
  getTrackStreamUrl,
  moveTrack,
} from '../controllers/music.controller';
import { authenticate } from '../middleware/auth';


const router = Router();

router.use(authenticate);

// Album routes
router.get('/albums', getAlbums);
router.post('/albums', createAlbum);
router.get('/albums/:id', getAlbumById);
router.put('/albums/:id', updateAlbum);
router.delete('/albums/:id', deleteAlbum);

// Track routes
router.post('/albums/:id/tracks/presigned', authenticate, getPresignedTrackData);
router.post('/albums/:id/tracks', authenticate, createTrack);
router.delete('/albums/:id/tracks/:trackId', deleteTrack);
router.put('/albums/:id/tracks/:trackId/move', authenticate, moveTrack);
router.get('/albums/:id/tracks/:trackId/stream', getTrackStreamUrl);

export default router;
