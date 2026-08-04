import { Router } from 'express';
import {
  getImageAlbums,
  createImageAlbum,
  deleteImageAlbum,
  getImages,
  uploadImage,
  deleteImage,
  moveImage,
} from '../controllers/image.controller';
import { authenticate } from '../middleware/auth';


const router = Router();

router.use(authenticate);

// Album routes
router.get('/albums', getImageAlbums);
router.post('/albums', createImageAlbum);
router.delete('/albums/:id', deleteImageAlbum);

// Image routes
router.get('/', getImages);
router.post('/upload', uploadImage);
router.delete('/:id', deleteImage);
router.put('/:id/move', moveImage);

export default router;
