import pool from '../utils/db.js';

// 获取所有交易记录
export const getAllTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transactions ORDER BY trade_time');
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取交易记录失败',
      error: error.message
    });
  }
};

// 获取单个交易记录
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '交易记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取交易记录失败',
      error: error.message
    });
  }
};

// 创建新交易记录
export const createTransaction = async (req, res) => {
  try {
    const { data_source, trade_time, trade_type, counterparty, description, direction, amount } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO transactions (data_source, trade_time, trade_type, counterparty, description, direction, amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data_source, trade_time, trade_type, counterparty, description, direction, amount]
    );
    
    res.status(201).json({
      success: true,
      message: '交易记录创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建交易记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建交易记录失败',
      error: error.message
    });
  }
};

// 更新交易记录
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { data_source, trade_time, trade_type, counterparty, description, direction, amount } = req.body;
    
    const [result] = await pool.query(
      `UPDATE transactions SET data_source = ?, trade_time = ?, trade_type = ?, 
       counterparty = ?, description = ?, direction = ?, amount = ? WHERE id = ?`,
      [data_source, trade_time, trade_type, counterparty, description, direction, amount, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '交易记录不存在'
      });
    }
    
    res.json({
      success: true,
      message: '交易记录更新成功'
    });
  } catch (error) {
    console.error('更新交易记录失败:', error);
    res.status(500).json({
      success: false,
      message: '更新交易记录失败',
      error: error.message
    });
  }
};

// 删除交易记录
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '交易记录不存在'
      });
    }
    
    res.json({
      success: true,
      message: '交易记录删除成功'
    });
  } catch (error) {
    console.error('删除交易记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除交易记录失败',
      error: error.message
    });
  }
};