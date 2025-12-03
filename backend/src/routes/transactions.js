import express from 'express';
import { 
  getAllTransactions, 
  getTransactionById, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '../controllers/transactionController.js';

const router = express.Router();

// GET /api/transactions - 获取所有交易记录
router.get('/', getAllTransactions);

// GET /api/transactions/:id - 获取单个交易记录
router.get('/:id', getTransactionById);

// POST /api/transactions - 创建新交易记录
router.post('/', createTransaction);

// PUT /api/transactions/:id - 更新交易记录
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id - 删除交易记录
router.delete('/:id', deleteTransaction);

export default router;