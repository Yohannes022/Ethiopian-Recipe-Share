import express from 'express';
import { globalSearch } from '../controllers/search.controller';

const router = express.Router();

// Search endpoint
router.get('/', globalSearch);

export default router;
