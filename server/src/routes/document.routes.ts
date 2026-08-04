import { Router } from 'express';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  getDocumentFolders,
  createDocumentFolder,
  deleteDocumentFolder,
  moveDocument,
} from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Folder routes
router.get('/folders', getDocumentFolders);
router.post('/folders', createDocumentFolder);
router.delete('/folders/:id', deleteDocumentFolder);

// Document routes
router.get('/', getDocuments);
router.post('/upload', uploadDocument);
router.get('/:id/download', downloadDocument);
router.delete('/:id', deleteDocument);
router.put('/:id/move', moveDocument);

export default router;
