<template>
    <div>
        <header>
            <h1 class="content-title">交易记录</h1>
            <p class="content-subtitle">查看和管理你的所有交易记录</p>
        </header>
        <main>
            <!-- 筛选条件卡片 -->
            <div class="card">
                <h3 style="margin-bottom: 20px;">筛选条件</h3>
                <div class="filter-actions">
                    <div class="block">
                        <label>交易时间范围</label>
                        <el-date-picker v-model="filterData.dateRange" type="daterange" unlink-panels
                            start-placeholder="Start date" end-placeholder="End date" @clear="clearDateFilter" />
                    </div>
                    <div class="block">
                        <label>交易类型</label>
                        <el-select v-model="filterData.tradeType" placeholder="交易类型" style="width: 200px;">
                            <el-option label="全部类型" value="alltype"></el-option>
                            <el-option label="收入" value="income"></el-option>
                            <el-option label="支出" value="expense"></el-option>
                            <el-option label="不计收支" value="neutral"></el-option>
                        </el-select>
                    </div>
                    <div class="block-btn">
                        <el-button @click="applyFilter">应用筛选</el-button>
                    </div>
                    <div class="block-btn">
                        <el-button @click="resetFilter">重置</el-button>
                    </div>
                </div>
            </div>
            <!-- 交易列表卡片 -->
            <div class="card">
                <div class="card-header">
                    <h3 style="margin-bottom: 20px;">交易列表</h3>
                    <div class="btn-div">
                        <el-button @click="addtransaction">添加交易</el-button>
                        <el-button @click="uploadtransaction">导入交易</el-button>
                        <el-button @click="exportTransactions">导出交易</el-button>
                    </div>
                </div>

                <div class="table-content">
                    <ElTable :data="transactions" style="width: 100%" show-overflow-tooltip stripe :header-cell-style="{
                        background: '#f9fafb',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        height: '50px'
                    }" :cell-style="{ height: '45px' }" @sort-change="handleSortChange">
                        <el-table-column prop="data_source" label="数据来源"></el-table-column>
                        <el-table-column prop="trade_time" label="交易时间" sortable
                            :formatter="(row) => formatDate(row.trade_time)"></el-table-column>
                        <el-table-column prop="trade_type" label="交易类型"></el-table-column>
                        <el-table-column prop="counterparty" label="交易对方"></el-table-column>
                        <el-table-column prop="description" label="商品说明"></el-table-column>
                        <el-table-column prop="direction" label="收/支"></el-table-column>
                        <el-table-column prop="amount" label="金额" sortable></el-table-column>
                    </ElTable>
                </div>

                <!-- 分页 -->
                <div class="card-flooter">
                    <el-pagination layout="total, prev, pager, next" :page-size="pageSize" :total="totalCount"
                        @current-change="handlePageChange" />
                </div>
            </div>
            <TranstactionModule :showTransactionModule.sync="showTransactionModule" :formData="formData" :alter="alter"
                @submit-form="submitForm" @cancel-form="cancelForm" />
            <uploadModule v-model:show-upload-module="showUploadModule" @upload-success="handleUploadSuccess"/>
        </main>
    </div>
</template>

<script setup>
import uploadModule from './uploadModule.vue';
import { ElPagination } from 'element-plus';
import axios from 'axios';
import { ref, onMounted } from 'vue';
import TranstactionModule from './TranstactionModule.vue';

const showUploadModule = ref(false)
const alltransactions = ref([])
const showTransactionModule = ref(false)
const alter = ref({
    isShow: false,
    title: '',
    type: 'info'
})
const formData = ref({
    trade_time: '',
    trade_type: '',
    counterparty: '',
    description: '',
    direction: '',
    amount: null
})
const filterData = ref({
    dateRange: [],
    tradeType: 'alltype',
    transactions: []
})
// 分页相关数据
const page = ref(1);  // 当前页
const pageSize = ref(15);  // 每页显示的条数
const totalCount = ref(0);  // 总记录数
const transactions = ref([]);  // 存储当前页的数据
const sortState = ref({ prop: '', order: '' }); // 存储排序状态

//添加交易
function addtransaction() {
    showTransactionModule.value = true
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
//获取交易数据
async function fetchTransactionData() {
    axios.get('http://localhost:3001/api/transactions')
        .then(({ data }) => {
            console.log('Fetched transaction data:', data)
            alltransactions.value = data.data.map(item => ({
                data_source: item.data_source,
                trade_time: item.trade_time,
                trade_type: item.trade_type,
                counterparty: item.counterparty,
                description: item.description,
                direction: item.direction,
                amount: Number(item.amount)
            }))
            totalCount.value = alltransactions.value.length; // 更新总记录数

            // 初始化显示第一页数据
            updatePageData()
            console.log('All transactions:', alltransactions.value)
        })
        .catch(error => {
            console.error('Error fetching transaction data:', error)
        })
}
//更新分页数据
function updatePageData() {
    const start = (page.value - 1) * pageSize.value
    const end = start + pageSize.value

    // 判断是否有活跃的筛选条件
    const hasActiveFilter = filterData.value.dateRange.length > 0 || filterData.value.tradeType !== 'alltype'
    
    // 如果有筛选条件，使用筛选结果；否则使用全部数据
    let sourceData = hasActiveFilter ? filterData.value.transactions : alltransactions.value

    // 如果有排序状态，先对完整数据源进行排序
    if (sortState.value.prop && sortState.value.order) {
        sourceData = sortData(sourceData, sortState.value.prop, sortState.value.order)
    }

    // 截取当前页数据
    transactions.value = sourceData.slice(start, end)

    console.log(`显示第 ${page.value} 页数据，范围：${start} - ${end}，数据源：${hasActiveFilter ? '筛选结果' : '全部数据'}`)
}

//处理排序
function handleSortChange({ prop, order }) {
    sortState.value = { prop, order }
    updatePageData()
}

//排序数据
function sortData(data, prop, order) {
    const sortedData = [...data] // 创建副本避免修改原数组
    
    sortedData.sort((a, b) => {
        let aVal = a[prop]
        let bVal = b[prop]
        
        // 特殊处理 trade_time，转换为 Date 对象进行比较
        if (prop === 'trade_time') {
            aVal = new Date(aVal).getTime()
            bVal = new Date(bVal).getTime()
        }
        
        // 特殊处理 amount，转换为数字进行比较
        if (prop === 'amount') {
            aVal = Number(aVal)
            bVal = Number(bVal)
        }
        
        if (order === 'ascending') {
            return aVal > bVal ? 1 : -1
        } else if (order === 'descending') {
            return aVal < bVal ? 1 : -1
        }
        return 0
    })
    
    return sortedData
}
//处理页码变化
function handlePageChange(newPage) {
    page.value = newPage
    updatePageData()
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
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
//应用筛选
function applyFilter() {
    console.log('Filtering with data:', filterData.value)
    
    // 获取筛选条件
    const [startDate, endDate] = filterData.value.dateRange
    const tradeType = filterData.value.tradeType
    
    filterData.value.transactions = alltransactions.value.filter(item => {
        const tradeTime = new Date(item.trade_time)
        let dateMatch = true
        let typeMatch = true
        
        // 日期范围筛选 - 使用 Date 对象进行时间戳比较
        if (startDate && endDate) {
            const startTime = new Date(startDate).setHours(0, 0, 0, 0)
            const endTime = new Date(endDate).setHours(23, 59, 59, 999)
            const itemTime = new Date(tradeTime).getTime()
            
            dateMatch = itemTime >= startTime && itemTime <= endTime
            console.log('Date range filter:', new Date(startTime), new Date(endTime), 'Item date:', tradeTime, 'Match:', dateMatch)
        }
        
        // 交易类型筛选
        if (tradeType !== 'alltype') {
            if (tradeType === 'income') {
                typeMatch = item.direction === '收入'
            } else if (tradeType === 'expense') {
                typeMatch = item.direction === '支出'
            }
        }
        
        return dateMatch && typeMatch
    })
    
    // 重置分页并更新数据
    page.value = 1
    totalCount.value = filterData.value.transactions.length
    updatePageData()
    console.log('Filter applied. Results:', filterData.value.transactions.length, 'Total count:', totalCount.value)
}
//重置筛选
function resetFilter() {
    filterData.value = {
        dateRange: [],
        tradeType: 'alltype',
        transactions: []
    }
    // 重置分页状态
    page.value = 1
    totalCount.value = alltransactions.value.length
    updatePageData()
    console.log('Filter reset')
    // 这里可以添加重置逻辑
}
//清除日期筛选
function clearDateFilter() {
    filterData.value.dateRange = []
    console.log('Date filter cleared')
}
//上传交易
function uploadtransaction() {
    showUploadModule.value = true
    console.log('Upload transaction clicked')
}

//处理上传成功
function handleUploadSuccess() {
    // 刷新交易数据列表
    fetchTransactionData()
    console.log('File upload successful, refreshing data')
}

//导出交易
function exportTransactions() {
    // 判断是否有活跃的筛选条件
    const hasActiveFilter = filterData.value.dateRange.length > 0 || filterData.value.tradeType !== 'alltype'
    
    // 如果有筛选条件，导出筛选结果；否则导出全部数据
    const data = hasActiveFilter ? filterData.value.transactions : alltransactions.value
    
    if (data.length === 0) {
        alter.value = {
            isShow: true,
            title: '没有可导出的交易数据！',
            type: 'warning'
        }
        setTimeout(() => {
            alter.value.isShow = false
        }, 2000)
        return
    }
    
    // 准备CSV数据
    const headers = ['数据来源', '交易时间', '交易类型', '交易对方', '商品说明', '收/支', '金额']
    const csvContent = [
        headers.join(','),
        ...data.map(item => [
            item.data_source,
            item.trade_time,
            item.trade_type,
            `"${item.counterparty}"`, // 用引号包裹可能包含逗号的文本
            `"${item.description}"`,
            item.direction,
            item.amount
        ].join(','))
    ].join('\n')
    
    // 创建Blob并下载
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `交易记录_${new Date().toLocaleDateString('zh-CN')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alter.value = {
        isShow: true,
        title: `成功导出 ${data.length} 条交易记录！`,
        type: 'success'
    }
    setTimeout(() => {
        alter.value.isShow = false
    }, 2000)
}

onMounted(() => {
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

.card-flooter {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgb(229, 231, 235);
}

.block {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.filter-actions {
    display: flex;
    gap: 10px;
}

.filter-actions label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}

.block-btn {
    display: flex;
    align-items: flex-end;
}
</style>