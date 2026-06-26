import { Router } from 'express';
import {
  getPasswords,
  getPasswordById,
  createPassword,
  updatePassword,
  deletePassword,
} from '../controllers/password.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getPasswords);
router.post('/', createPassword);
router.get('/:id', getPasswordById);
router.put('/:id', updatePassword);
router.delete('/:id', deletePassword);

export default router;
