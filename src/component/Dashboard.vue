<template>
    <div>
        <header>
            <h1 class="content-title">财务仪表盘</h1>
            <p class="content-subtitle">今日是{{ currentdate }}，来看看你的财务状况吧</p>
        </header>
        <div class="stats-grid">
            <StatCard :value="10.9" label="本月收入" style="color: #4ADE80;"></StatCard>
            <StatCard :value="10.9" label="本月支出" style="color: #F87171;"></StatCard>
            <StatCard :value="10.9" label="本月结余" style="color: #60A5FA;"></StatCard>
        </div>
        <div class="card">
            <h3 style="margin-bottom: 20px;">最近交易记录</h3>
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
        </div>
    </div>
    <QuickAction></QuickAction>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StatCard from './StatCard.vue'
import QuickAction from './QuickAction.vue'

const currentdate = ref('')

function getCurrentDate() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    currentdate.value = ` ${year} 年 ${month} 月 ${day} 日`
}
onMounted(() => {
    getCurrentDate()
})
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

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 10px;
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
</style>