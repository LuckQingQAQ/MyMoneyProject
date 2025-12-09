<template>
    <header>
        <h1 class="content-title">财务仪表盘</h1>
        <p class="content-subtitle">今日是{{ currentdate }}，来看看你的财务状况吧</p>
    </header>
    <main>
        <!-- 顶部卡片 -->
        <div class="stats-grid">
            <StatCard :value="StatCardValue.income" label="本月收入" style="color: #4ADE80;"></StatCard>
            <StatCard :value="StatCardValue.expense" label="本月支出" style="color: #F87171;"></StatCard>
            <StatCard :value="StatCardValue.balance" label="本月结余" style="color: #60A5FA;"></StatCard>
        </div>
        <!-- 最近交易记录表格 -->
        <div class="card">
            <h3 style="margin-bottom: 20px;">最近交易记录</h3>
            <div>
                <ElTable :data="transactions" style="width: 100%" show-overflow-tooltip stripe :header-cell-style="{
                    background: '#f9fafb',
                    fontWeight: '600',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb',
                    height: '50px'
                }" :cell-style="{ height: '45px' }">
                    <el-table-column prop="data_source" label="数据来源"></el-table-column>
                    <el-table-column prop="trade_time" label="交易时间"
                        :formatter="(row) => formatDate(row.trade_time)"></el-table-column>
                    <el-table-column prop="trade_type" label="交易类型"></el-table-column>
                    <el-table-column prop="counterparty" label="交易对方"></el-table-column>
                    <el-table-column prop="description" label="商品说明"></el-table-column>
                    <el-table-column prop="direction" label="收/支"></el-table-column>
                    <el-table-column prop="amount" label="金额"></el-table-column>
                </ElTable>
            </div>
        </div>
    </main>
    <footer>
        <!--快速操作按钮-->
        <div class="card">
            <h3 style="padding-bottom: 20px;">快速操作</h3>
            <div class="quick-buttom-div">
                <ElButton @click="addincome">+ 记一笔收入</ElButton>
                <ElButton @click="addexpense">- 记一笔支出</ElButton>
                <ElButton>
                    <RouterLink to="/Reports" style="color: #606266; text-decoration: none;">📊 查看报表</RouterLink>
                </ElButton>
            </div>
        </div>
    </footer>
    <TranstactionModule :showTransactionModule.sync="showTransactionModule" :formData="formData" :alter="alter"
        @submit-form="submitForm" @cancel-form="cancelForm" />
</template>

<script setup>
import TranstactionModule from './TranstactionModule.vue'
import { ref, onMounted, watch } from 'vue'
import StatCard from './StatCard.vue'
import { ElButton, ElTable } from 'element-plus'
import axios from 'axios'

const currentdate = ref('')
const transactions = ref([])
const StatCardValue = ref(
    { income: 0, expense: 0, balance: 0 }
)
const showTransactionModule = ref(false)
const alter = ref({
    isShow: false,
    title: '',
    type: 'info'
})

const alltransactions = ref([])

const formData = ref({
    trade_time: '',
    trade_type: '',
    counterparty: '',
    description: '',
    direction: '',
    amount: null
})
//计算每月收入支出结余
watch(alltransactions, () => {
    calculateMonthlyStats(alltransactions)
})

async function calculateMonthlyStats(alltransactions) {
    let income = 0
    let expense = 0
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    
    console.log('Calculating monthly stats for current month:', currentYear, '年', currentMonth + 1, '月')
    console.log('Total transactions:', alltransactions.value.length)
    
    alltransactions.value.forEach(item => {
        const tradeDate = new Date(item.trade_time)
        const tradeYear = tradeDate.getFullYear()
        const tradeMonth = tradeDate.getMonth()
        
        // 只计算当前月份的数据
        if (tradeYear === currentYear && tradeMonth === currentMonth) {
            if (item.direction === '收入') {
                income += item.amount
                console.log('Found income transaction:', item.trade_time, item.amount)
            } else if (item.direction === '支出') {
                expense += item.amount
                console.log('Found expense transaction:', item.trade_time, item.amount)
            }
        } else {
        }
    })

    const balance = income - expense

    StatCardValue.value = {
        income,
        expense,
        balance
    }
    console.log('Monthly stats calculated for current month:', StatCardValue.value)
}
//获取交易数据
async function fetchTransactionData() {
    axios.get('http://localhost:3001/api/transactions')
        .then(({ data }) => {
            console.log('Fetched transaction data:', data)
            transactions.value = data.data.slice(-10).map(item => ({
                data_source: item.data_source,
                trade_time: item.trade_time,
                trade_type: item.trade_type,
                counterparty: item.counterparty,
                description: item.description,
                direction: item.direction,
                amount: Number(item.amount)
            }))
            alltransactions.value = data.data.map(item => ({
                data_source: item.data_source,
                trade_time: item.trade_time,
                trade_type: item.trade_type,
                counterparty: item.counterparty,
                description: item.description,
                direction: item.direction,
                amount: Number(item.amount)
            }))
            console.log('Processed transactions:', transactions.value)
            console.log('All transactions:', alltransactions.value)
        })
        .catch(error => {
            console.error('Error fetching transaction data:', error)
        })
}
//获取当前日期
function getCurrentDate() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    currentdate.value = ` ${year} 年 ${month} 月 ${day} 日`
}
//格式化日期函数
function formatDate(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    console.log('Formatted date:', `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`)
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

//提交表单
async function submitForm(formData) {
    // 表单验证
    if (!formData.trade_time || !formData.trade_type || !formData.counterparty ||
        !formData.description || !formData.direction || formData.amount === null) {
        alter.value = {
            isShow: true,
            title: '请填写完整的交易信息！',
            type: 'warning'
        }
        return
    }
    alter.value.isShow = false
    try {
        // 准备提交的数据
        const submitData = {
            data_source: '手动输入', // 设置数据来源为手动录入
            trade_time: formatDate(formData.trade_time),
            trade_type: formData.trade_type,
            counterparty: formData.counterparty,
            description: formData.description,
            direction: formData.direction,
            amount: formData.amount
        }
        console.log('正在提交数据:', submitData)
        // 调用后端API创建交易记录
        const response = await axios.post('http://localhost:3001/api/transactions', submitData)
        if (response.data.success) {
            // 成功提示
            alter.value = {
                isShow: true,
                title: '交易记录创建成功！',
                type: 'success'
            }
            // 清空表单
            formData.value = {
                trade_time: '',
                trade_type: '',
                counterparty: '',
                description: '',
                direction: '',
                amount: null
            }
            // 关闭对话框
            setTimeout(() => {
                showTransactionModule.value = false
                alter.value.isShow = false
            }, 1000)

            // 刷新交易数据列表
            await fetchTransactionData()
        } else {
            // 后端返回错误
            alter.value = {
                isShow: true,
                title: '提交失败：' + (response.data.message || '未知错误'),
                type: 'error'
            }
        }
    } catch (error) {
        console.error('提交失败:', error)
        alter.value = {
            isShow: true,
            title: '提交失败：' + (error.response?.data?.message || error.message || '网络错误'),
            type: 'error'
        }
    }
}
//取消提交
function cancelForm() {
    showTransactionModule.value = false
    formData.value = {
        trade_time: '',
        trade_type: '',
        counterparty: '',
        description: '',
        direction: '',
        amount: null
    }
    // 这里可以添加取消逻辑
    console.log('Form cancelled')
}

function addincome() {
    showTransactionModule.value = true
    formData.value.direction = '收入'
}

function addexpense() {
    showTransactionModule.value = true
    formData.value.direction = '支出'
}

onMounted(() => {
    getCurrentDate(),
        fetchTransactionData()
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