import express from 'express';
import { uploadFile, uploadMiddleware } from '../controllers/uploadController.js';

const router = express.Router();

// POST /api/upload - 上传交易记录文件
router.post('/', uploadMiddleware, uploadFile);

export default router;