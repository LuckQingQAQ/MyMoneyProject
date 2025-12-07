import multer from 'multer';
import xlsx from 'xlsx';
import csv from 'csv-parser';
import fs from 'fs';
import { Readable } from 'stream';
import iconv from 'iconv-lite';
import pool from '../utils/db.js';

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // 使用安全的文件名，避免中文乱码问题
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.originalname.split('.').pop();
    cb(null, `${timestamp}-${random}.${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // 只允许csv和xlsx文件
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.originalname.endsWith('.csv') ||
        file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传CSV或XLSX文件'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  }
});

// 解析微信支付账单（Excel格式）
const parseWeChatBill = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // 微信支付账单表头在第17行（索引16）
  const headerRowIndex = 16;
  
  if (headerRowIndex >= data.length) {
    throw new Error('无法识别微信支付账单格式');
  }
  
  const headers = data[headerRowIndex];
  const transactions = [];
  
  // 从标题行之后开始解析数据
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const transaction = {};
    headers.forEach((header, index) => {
      transaction[header] = row[index];
    });
    
    // 转换数据格式
    if (transaction['交易时间']) {
      transactions.push({
        data_source: '微信支付',
        trade_time: convertWeChatDate(transaction['交易时间']),
        trade_type: transaction['交易类型'] || '',
        counterparty: transaction['交易对方'] || '',
        description: transaction['商品'] || transaction['商品说明'] || '',
        direction: convertWeChatDirection(transaction['收/支']),
        amount: parseWeChatAmount(transaction['金额(元)'])
      });
    }
  }
  
  return transactions;
};

// 解析支付宝账单（CSV格式）
const parseAlipayBill = async (filePath) => {
  return new Promise((resolve, reject) => {
    const transactions = [];
    
    console.log("开始读取支付宝CSV文件（手动解析GBK格式）");

    // 读取整个文件并解码GBK
    const buffer = fs.readFileSync(filePath);
    const content = iconv.decode(buffer, 'gbk');
    
    // 按行分割，过滤空行
    const rows = content.split(/\r?\n/).filter(line => line.trim() !== '');
    
    console.log(`文件共 ${rows.length} 行`);

    // 找到真正的表头（包含"交易时间"）
    const headerLineIndex = rows.findIndex(line => line.includes('交易时间'));
    
    if (headerLineIndex === -1) {
      console.error("❌ 未找到表头：文件格式不匹配");
      return resolve([]);
    }

    const headerLine = rows[headerLineIndex];
    const headers = headerLine.split(',').map(h => h.trim());
    
    console.log("正确表头：", headers);

    // 从表头之后开始解析数据
    const startIndex = headerLineIndex + 1;

    for (let i = startIndex; i < rows.length; i++) {
      const line = rows[i].trim();
      if (!line) continue;

      // 手动分割CSV行（处理引号内的逗号）
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());

      // 跳过字段数不符的行
      if (values.length < headers.length) continue;

      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      // 必须有"交易时间"且不是重复表头
      if (!row['交易时间'] || row['交易时间'] === '交易时间') continue;

      transactions.push({
        data_source: '支付宝',
        trade_time: convertAlipayDate(row['交易时间']),
        trade_type: row['交易分类'] || '',
        counterparty: row['交易对方'] || '',
        description: row['商品说明'] || '',
        direction: row['收/支'] || '',
        amount: parseAlipayAmount(row['金额'])
      });
    }

    console.log(`解析完成，得到 ${transactions.length} 条记录`);
    resolve(transactions);
  });
};

// 转换微信支付日期格式
const convertWeChatDate = (dateStr) => {
  if (!dateStr) return null;
  
  // 微信支付格式: 2025-11-26 11:16:29
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`无效的日期格式: ${dateStr}`);
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// 转换支付宝日期格式
const convertAlipayDate = (dateStr) => {
  if (!dateStr) return null;
  
  // 支付宝格式: 2025-11-26 10:54:51
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`无效的日期格式: ${dateStr}`);
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// 转换微信支付方向
const convertWeChatDirection = (direction) => {
  if (!direction) return '支出';
  if (direction === '收入') return '收入';
  if (direction === '支出') return '支出';
  return '支出'; // 默认为支出
};

// 解析微信支付金额
const parseWeChatAmount = (amountStr) => {
  if (!amountStr) return 0;
  
  // 移除人民币符号和空格
  const cleanAmount = amountStr.replace(/[¥\s]/g, '');
  const amount = parseFloat(cleanAmount);
  return isNaN(amount) ? 0 : amount;
};

// 解析支付宝金额
const parseAlipayAmount = (amountStr) => {
  if (!amountStr) return 0;
  
  const amount = parseFloat(amountStr);
  return isNaN(amount) ? 0 : amount;
};

// 批量插入交易记录
const batchInsertTransactions = async (transactions) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const transaction of transactions) {
      // 检查是否已存在相同的交易（基于交易时间、对方和金额）
      const [existing] = await connection.query(
        'SELECT id FROM transactions WHERE trade_time = ? AND counterparty = ? AND amount = ?',
        [transaction.trade_time, transaction.counterparty, transaction.amount]
      );
      
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO transactions (data_source, trade_time, trade_type, counterparty, description, direction, amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [transaction.data_source, transaction.trade_time, transaction.trade_type, 
           transaction.counterparty, transaction.description, transaction.direction, transaction.amount]
        );
        successCount++;
      } else {
        skipCount++;
      }
    }
    
    await connection.commit();
    return { successCount, skipCount };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// 处理文件上传
export const uploadFile = async (req, res) => {
  try {
    console.log('=== 文件上传开始 ===');
    console.log('上传的文件信息:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path
    });
    
    if (!req.file) {
      console.error('错误: 没有上传文件');
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }
    
    const filePath = req.file.path;
    let transactions = [];
    
    console.log('使用文件路径:', filePath);
    console.log('原始文件名:', req.file.originalname);
    
    try {
      // 根据文件类型解析
      if (req.file.originalname.endsWith('.csv')) {
        console.log('开始解析支付宝CSV文件');
        transactions = await parseAlipayBill(filePath);
      } else if (req.file.originalname.endsWith('.xlsx')) {
        console.log('开始解析微信XLSX文件');
        transactions = parseWeChatBill(filePath);
      } else {
        throw new Error('不支持的文件格式');
      }
      
      console.log('文件解析完成，共解析出', transactions.length, '条交易记录');
      console.log('解析结果示例:', transactions.slice(0, 3));
      
      // 批量插入数据库
      const result = await batchInsertTransactions(transactions);
      
      // 删除临时文件
      fs.unlinkSync(filePath);
      console.log('临时文件已删除');
      
      res.json({
        success: true,
        message: `成功导入 ${result.successCount} 条交易记录，跳过 ${result.skipCount} 条重复记录`,
        data: {
          total: transactions.length,
          imported: result.successCount,
          skipped: result.skipCount
        }
      });
      
    } catch (parseError) {
      console.error('解析或插入过程中出错:', parseError);
      // 删除临时文件
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }
    
  } catch (error) {
    console.error('文件处理失败:', error);
    res.status(500).json({
      success: false,
      message: '文件处理失败: ' + error.message,
      error: error.message
    });
  }
};

// 导出multer中间件
export const uploadMiddleware = upload.single('file');

// 导出解析函数用于测试
export { parseAlipayBill };