import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './src/routes/transactions.js';
import uploadRoutes from './src/routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/transactions', transactionRoutes);
app.use('/api/upload', uploadRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`交易API: http://localhost:${PORT}/api/transactions`);
  console.log(`上传API: http://localhost:${PORT}/api/upload`);
});