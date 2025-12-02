<template>
    <div>
        <header>
            <h1 class="content-title">交易记录</h1>
            <p class="content-subtitle">查看和管理你的所有交易记录</p>
        </header>
        <main>
            <div class="card">
                <h3 style="margin-bottom: 20px;">筛选条件</h3>
                <div class="filter-component">
                    <div class="filter-group">
                        <label>开始日期</label>
                        <input type="date" class="filter-input" />
                    </div>
                    <div class="filter-group">
                        <label>结束日期</label>
                        <input type="date" class="filter-input" />
                    </div>
                    <div class="filter-group">
                        <label>交易类型</label>
                        <select class="filter-select">
                            <option value="alltype">全部类型</option>
                            <option value="income">收入</option>
                            <option value="expense">支出</option>
                        </select>
                    </div>
                    <div class="btn-div">
                        <button class="apply-filter">应用筛选</button>
                    </div>
                    <div class="btn-div">
                        <button class="rest-filter">重置</button>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 style="margin-bottom: 20px;">交易列表</h3>
                    <button class="add-btn">新增交易</button>
                </div>

                <div class="table-content">
                    <table class>
                        <thead>
                            <tr>
                                <th>数据来源</th>
                                <th>交易时间</th>
                                <th>交易类型</th>
                                <th>交易对方</th>
                                <th>商品说明</th>
                                <th>收/支</th>
                                <th>金额</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>用户写入</td>
                                <td>2025-11-26 10:54:51</td>
                                <td>餐饮美食</td>
                                <td>淘宝闪购</td>
                                <td>辣椒炒肉(师专A2食堂店)外卖订单</td>
                                <td>支出</td>
                                <td>12.38</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="card-flooter">
                    <el-pagination layout="prev, pager, next" :total="100"/>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ElPagination } from 'element-plus';


</script>

<style lang="scss" scoped>
header {
    margin-bottom: 30px;
}

.content-title {
    font-size: 28px;
    color: #111827;
    margin-bottom: 8px;
}

.content-subtitle {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    color: #6b7280;
}

.card {
    background: #ffffff;
    border-radius: 16px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, .06);
    transition: transform .3s, box-shadow .3s;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, .08);
    }
}

.filter-component {
    display: flex;
    flex-direction: row;
    gap: 20px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}


.filter-group label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}

.filter-input {
    font-family: monospace;
}


.filter-input,
.filter-select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    min-width: 140px;
}

.filter-select {
    height: 39.33px;
}

.filter-actions {
    display: flex;
    gap: 10px;
}

.filter-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s;
}


table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

table th {
    background: #f9fafb;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
}

table td {
    padding: 12px;
    border-bottom: 1px solid #f3f4f6;
}

table tr:hover {
    background: #f9fafb;
}

table tbody tr {
    transition: transform 0.16s ease, box-shadow 0.16s ease;

    &:active {
        transform: scale(0.998);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
    }
}

.rest-filter,
.apply-filter {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    min-width: 100px;
    height: 39.33px;
    color: rgb(146, 105, 56);
}

.btn-div {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;

}

.card-header {
    display: flex;
    height: 36px;
    justify-content: space-between;
    margin-bottom: 20px;
}

.add-btn {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    min-width: 80px;
    color: rgb(146, 105, 56);
}

.card-flooter{
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgb(229, 231, 235);
}
</style>