<template>
  <header>
    <h1 class="content-title">报表分析</h1>
    <p class="content-subtitle">分析你的财务状况和支出趋势</p>
  </header>
  <div class="stats-grid">
    <StatCard :value="StatCardValue.income" label="本月收入" style="color: #4ADE80;"></StatCard>
    <StatCard :value="StatCardValue.expense" label="本月支出" style="color: #F87171;"></StatCard>
    <StatCard :value="StatCardValue.balance" label="本月结余" style="color: #60A5FA;"></StatCard>
  </div>

  <div class="card">
    <h3 style="margin-bottom: 20px;">支出分类统计</h3>
    <div v-if="hasNoData" class="no-data-container">
      <el-empty description="暂无数据" :image-size="100"></el-empty>
    </div>
    <div v-else>
      <div style="margin-bottom: 20px;">
        <el-select v-model="selectedMonth.selectedExpenseMonth" placeholder="选择月份" style="width: 200px;">
          <el-option v-for="value in selectedMonth.Lastest12Months" :label="value" :value="value"></el-option>
        </el-select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div ref="expensePieChartRef" class="chart-container"></div>
        <div ref="expenseBarChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin-bottom: 20px;">收入来源分析</h3>
    <div v-if="hasNoData" class="no-data-container">
      <el-empty description="暂无数据" :image-size="100"></el-empty>
    </div>
    <div v-else>
      <div style="margin-bottom: 20px;">
        <el-select v-model="selectedMonth.selectedIncomeMonth" placeholder="选择月份" style="width: 200px;">
          <el-option v-for="value in selectedMonth.Lastest12Months" :label="value" :value="value"></el-option>
        </el-select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div ref="incomePieChartRef" class="chart-container"></div>
        <div ref="incomeBarChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin-bottom: 20px;">月度趋势分析</h3>
    <div v-if="hasNoData" class="no-data-container">
      <el-empty description="暂无数据" :image-size="100"></el-empty>
    </div>
    <div v-else>
      <div ref="trendChartRef" class="chart-container" style="height: 500px;"></div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import StatCard from './StatCard.vue'
const alltransactions = ref([])
// 支出数据
const expenseData = ref({})
// 收入数据
const incomeData = ref({})

// 计算是否有数据
const hasNoData = computed(() => {
  return alltransactions.value.length === 0
})

const StatCardValue = ref(
  { income: 0, expense: 0, balance: 0 }
)
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

async function fetchTransactionData() {
  try {
    const { data } = await axios.get('http://localhost:3001/api/transactions')
    alltransactions.value = data.data.map(item => ({
      data_source: item.data_source,
      trade_time: item.trade_time,
      trade_type: item.trade_type,
      counterparty: item.counterparty,
      description: item.description,
      direction: item.direction,
      amount: Number(item.amount)
    }))
    console.log('All transactions:', alltransactions.value)
    await initData()
  } catch (error) {
    console.error('Error fetching transaction data:', error)
  }
}

const selectedMonth = ref({
  selectedExpenseMonth: '',
  selectedIncomeMonth: '',
  Lastest6Months: []
})

function getLast6Months() {
  const months = []
  const currentDate = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push(monthStr)
  }
  return months
}

function getLast12Months() {
  const months = []
  const currentDate = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push(monthStr)
  }
  return months
}

async function initSelectedMonth() {
  selectedMonth.value.Lastest12Months = getLast12Months()
  // 设置默认值为最近一个月（数组最后一个元素）
  const defaultMonth = selectedMonth.value.Lastest12Months[selectedMonth.value.Lastest12Months.length - 1]
  selectedMonth.value.selectedExpenseMonth = defaultMonth
  selectedMonth.value.selectedIncomeMonth = defaultMonth
  console.log('Initialized selected months:', selectedMonth.value)
}

async function initData() {
  await initSelectedMonth()
  expenseData.value = {}
  incomeData.value = {}
  
  // 处理支出数据 - 修复交易类型聚合逻辑
  alltransactions.value.filter(item => item.direction === '支出').forEach(item => {
    const tradeDate = new Date(item.trade_time)
    const tradeYearMonth = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}`
    
    if (!expenseData.value[tradeYearMonth]) {
      expenseData.value[tradeYearMonth] = []
    }
    
    // 修复：使用 find 方法查找已存在的交易类型
    const existingItem = expenseData.value[tradeYearMonth].find(
      d => d.name === item.trade_type
    )
    
    if (existingItem) {
      existingItem.value += item.amount
    } else {
      expenseData.value[tradeYearMonth].push({
        name: item.trade_type,
        value: item.amount
      })
    }
  })
  
  // 处理收入数据 - 修复交易类型聚合逻辑
  alltransactions.value.filter(item => item.direction === '收入').forEach(item => {
    const tradeDate = new Date(item.trade_time)
    const tradeYearMonth = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}`

    if (!incomeData.value[tradeYearMonth]) {
      incomeData.value[tradeYearMonth] = []
    }
    
    // 修复：使用 find 方法查找已存在的交易类型
    const existingItem = incomeData.value[tradeYearMonth].find(
      d => d.name === item.trade_type
    )
    
    if (existingItem) {
      existingItem.value += item.amount
    } else {
      incomeData.value[tradeYearMonth].push({
        name: item.trade_type,
        value: item.amount
      })
    }
  })
  
  // 计算月度趋势数据
  calculateMonthlyTrendData()
  
  console.log('Expense data by month and type:', expenseData.value)
  console.log('Income data by month and type:', incomeData.value)
}



// 月度趋势数据（将使用真实数据）
const monthlyTrendData = ref({
  months: [],
  income: [],
  expense: [],
  balance: []
})

// 计算最近12个月的真实趋势数据
function calculateMonthlyTrendData() {
  const months = getLast12Months()
  const trendData = {
    months: months,
    income: [],
    expense: [],
    balance: []
  }

  // 为每个月份计算收入、支出和结余
  months.forEach(month => {
    let monthIncome = 0
    let monthExpense = 0

    // 遍历所有交易记录，统计当前月份的数据
    alltransactions.value.forEach(item => {
      const tradeDate = new Date(item.trade_time)
      const tradeYearMonth = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}`
      
      if (tradeYearMonth === month) {
        if (item.direction === '收入') {
          monthIncome += item.amount
        } else if (item.direction === '支出') {
          monthExpense += item.amount
        }
      }
    })

    const monthBalance = monthIncome - monthExpense
    
    trendData.income.push(monthIncome)
    trendData.expense.push(monthExpense)
    trendData.balance.push(monthBalance)
  })

  monthlyTrendData.value = trendData
  console.log('Monthly trend data calculated:', monthlyTrendData.value)
}

let expensePieChart, expenseBarChart, incomePieChart, incomeBarChart, trendChart

// 初始化图表
const initCharts = () => {
  // 支出环状图
  expensePieChart = echarts.init(expensePieChartRef.value)

  // 支出水平条形图
  expenseBarChart = echarts.init(expenseBarChartRef.value)

  // 收入环状图
  incomePieChart = echarts.init(incomePieChartRef.value)

  // 收入水平条形图
  incomeBarChart = echarts.init(incomeBarChartRef.value)

  // 月度趋势图
  trendChart = echarts.init(trendChartRef.value)
}

// 更新支出图表
const updateExpenseCharts = () => {
  // 修复：检查图表实例是否存在
  if (!expensePieChart || !expenseBarChart) {
    console.warn('Chart instances not initialized yet, skipping update')
    return
  }

  const selectedMonthData = selectedMonth.value.selectedExpenseMonth;
  let data = expenseData.value[selectedMonthData];

  console.log('Updating expense charts with data:', data)
  if (!data || data.length === 0) {
    console.log(`No data found for selected expense month: ${selectedMonth.value.selectedExpenseMonth}, setting to 0`)
    data = [{ name: '无支出数据', value: 0 }]
  }
  // 环状图配置
  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }

  // 水平条形图配置
  const barOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '支出金额',
        type: 'bar',
        data: data.map(item => item.value),
        itemStyle: {
          color: '#67c23a',
          borderRadius: [0, 4, 4, 0]
        }
      }
    ]
  }

  expensePieChart.setOption(pieOption)
  expenseBarChart.setOption(barOption)
}

// 更新收入图表
const updateIncomeCharts = () => {
  // 修复：检查图表实例是否存在
  if (!incomePieChart || !incomeBarChart) {
    console.warn('Income chart instances not initialized yet, skipping update')
    return
  }

  const selectedMonthData = selectedMonth.value.selectedIncomeMonth;
  let data = incomeData.value[selectedMonthData];

  if (!data || data.length === 0) {
    console.log(`No data found for selected income month: ${selectedMonth.value.selectedIncomeMonth}, setting to 0`)
    data = [{ name: '无收入数据', value: 0 }]
  }
  // 环状图配置
  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '收入来源',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }

  // 水平条形图配置
  const barOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '收入金额',
        type: 'bar',
        data: data.map(item => item.value),
        itemStyle: {
          color: '#67c23a',
          borderRadius: [0, 4, 4, 0]
        }
      }
    ]
  }

  incomePieChart.setOption(pieOption)
  incomeBarChart.setOption(barOption)
}

// 更新趋势图表 - 修改：结余也使用 line 类型
const updateTrendChart = () => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['收入', '支出', '结余']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',  // 增加底部边距，为标签留出更多空间
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: monthlyTrendData.value.months,
      axisLabel: {
        margin: 15,
        interval: 0,
        fontSize: 11  // 调小字体避免重叠
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        data: monthlyTrendData.value.income,
        smooth: true,
        itemStyle: {
          color: '#67c23a'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
            ]
          }
        }
      },
      {
        name: '支出',
        type: 'line',
        data: monthlyTrendData.value.expense,
        smooth: true,
        itemStyle: {
          color: '#f56c6c'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
            ]
          }
        }
      },
      {
        name: '结余',
        type: 'line',  // 修改：从 'bar' 改为 'line'
        data: monthlyTrendData.value.balance,
        smooth: true,  // 添加：平滑曲线
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {  // 添加：面积样式
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      }
    ]
  }

  trendChart.setOption(option)
}

// 图表 DOM 引用
const expensePieChartRef = ref(null)
const expenseBarChartRef = ref(null)
const incomePieChartRef = ref(null)
const incomeBarChartRef = ref(null)
const trendChartRef = ref(null)

onMounted(() => {
  fetchTransactionData()
})

// 监听数据加载完成后再初始化图表
watch(alltransactions, async () => {
  if (alltransactions.value.length > 0) {
    console.log('Transactions loaded, initializing charts...')
    
    // 使用 nextTick 确保 DOM 已经渲染
    await nextTick()
    
    initCharts() // 初始化图表
    
    // 数据准备好后再更新图表
    updateExpenseCharts()
    updateIncomeCharts()
    updateTrendChart()

    // 响应式处理
    window.addEventListener('resize', () => {
      if (expensePieChart) expensePieChart.resize()
      if (expenseBarChart) expenseBarChart.resize()
      if (incomePieChart) incomePieChart.resize()
      if (incomeBarChart) incomeBarChart.resize()
      if (trendChart) trendChart.resize()
    })
  }
})
// 监听月份选择变化 - 修复为正确的监听方式
watch(() => selectedMonth.value.selectedExpenseMonth, (newMonth) => {
  console.log('Selected expense month changed to:', newMonth)
  if (newMonth) {
    updateExpenseCharts()
  }
})

watch(() => selectedMonth.value.selectedIncomeMonth, (newMonth) => {
  console.log('Selected income month changed to:', newMonth)
  if (newMonth) {
    updateIncomeCharts()
  }
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

.chart-container {
  width: 100%;
  height: 400px;
}

.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px;
}
</style>