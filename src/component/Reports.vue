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
    <div style="margin-bottom: 20px;">
      <el-select v-model="selectedExpenseMonth" placeholder="选择月份" style="width: 200px;">
        <el-option label="2025年01月" value="2025-01"></el-option>
        <el-option label="2025年02月" value="2025-02"></el-option>
        <el-option label="2025年03月" value="2025-03"></el-option>
        <el-option label="2025年04月" value="2025-04"></el-option>
      </el-select>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div ref="expensePieChartRef" class="chart-container"></div>
      <div ref="expenseBarChartRef" class="chart-container"></div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin-bottom: 20px;">收入来源分析</h3>
    <div style="margin-bottom: 20px;">
      <el-select v-model="selectedIncomeMonth" placeholder="选择月份" style="width: 200px;">
        <el-option label="2025年01月" value="2025-01"></el-option>
        <el-option label="2025年02月" value="2025-02"></el-option>
        <el-option label="2025年03月" value="2025-03"></el-option>
        <el-option label="2025年04月" value="2025-04"></el-option>
      </el-select>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div ref="incomePieChartRef" class="chart-container"></div>
      <div ref="incomeBarChartRef" class="chart-container"></div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin-bottom: 20px;">月度趋势分析</h3>
    <div ref="trendChartRef" class="chart-container" style="height: 500px;"></div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import StatCard from './StatCard.vue'
const alltransactions = ref([])

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
    } else {
      console.log('Skipping transaction from other month:', item.trade_time, 'Current month:', currentYear, currentMonth)
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
      console.log('All transactions:', alltransactions.value)
    })
    .catch(error => {
      console.error('Error fetching transaction data:', error)
    })
}

const selectedExpenseMonth = ref('2025-04')
const selectedIncomeMonth = ref('2025-04')

// 支出数据
const expenseData = {
  '2025-01': [
    { name: '餐饮', value: 2800 },
    { name: '交通', value: 1500 },
    { name: '购物', value: 2000 },
    { name: '娱乐', value: 1200 },
    { name: '其他', value: 600 }
  ],
  '2025-02': [
    { name: '餐饮', value: 3200 },
    { name: '交通', value: 1800 },
    { name: '购物', value: 2500 },
    { name: '娱乐', value: 1600 },
    { name: '其他', value: 800 }
  ],
  '2025-03': [
    { name: '餐饮', value: 2900 },
    { name: '交通', value: 1700 },
    { name: '购物', value: 2300 },
    { name: '娱乐', value: 1300 },
    { name: '其他', value: 750 }
  ],
  '2025-04': [
    { name: '餐饮', value: 3000 },
    { name: '交通', value: 1600 },
    { name: '购物', value: 2200 },
    { name: '娱乐', value: 1400 },
    { name: '其他', value: 700 }
  ]
}

// 收入数据
const incomeData = {
  '2025-01': [
    { name: '工资', value: 8500 },
    { name: '奖金', value: 2000 },
    { name: '投资收益', value: 1200 },
    { name: '兼职', value: 800 },
    { name: '其他收入', value: 500 }
  ],
  '2025-02': [
    { name: '工资', value: 8500 },
    { name: '奖金', value: 3000 },
    { name: '投资收益', value: 1500 },
    { name: '兼职', value: 1000 },
    { name: '其他收入', value: 600 }
  ],
  '2025-03': [
    { name: '工资', value: 8500 },
    { name: '奖金', value: 2500 },
    { name: '投资收益', value: 1300 },
    { name: '兼职', value: 900 },
    { name: '其他收入', value: 550 }
  ],
  '2025-04': [
    { name: '工资', value: 8500 },
    { name: '奖金', value: 2000 },
    { name: '投资收益', value: 1200 },
    { name: '兼职', value: 800 },
    { name: '其他收入', value: 500 }
  ]
}

// 月度趋势数据
const monthlyTrendData = {
  months: ['2025-01', '2025-02', '2025-03', '2025-04'],
  income: [13000, 14600, 13750, 13000],
  expense: [8100, 9700, 8950, 8900],
  balance: [4900, 4900, 4800, 4100]
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
  const data = expenseData[selectedExpenseMonth.value]

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
  const data = incomeData[selectedIncomeMonth.value]

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

// 更新趋势图表
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
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: monthlyTrendData.months.map(month => {
        const [year, monthNum] = month.split('-')
        return `${year}年${monthNum}月`
      })
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
        data: monthlyTrendData.income,
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
        data: monthlyTrendData.expense,
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
        type: 'bar',
        data: monthlyTrendData.balance,
        itemStyle: {
          color: '#409eff'
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
  // 使用 nextTick 确保 DOM 已经渲染
  nextTick(() => {
    initCharts()
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
  })
})

// 监听月份选择变化
watch(selectedExpenseMonth, () => {
  updateExpenseCharts()
})

watch(selectedIncomeMonth, () => {
  updateIncomeCharts()
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
</style>