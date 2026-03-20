<template>
  <div class="dashboard-page" v-loading="loading">
    <div class="dashboard-hero">
      <div>
        <p class="hero-kicker">管理概览</p>
        <h1>欢迎回来，{{ userStore.username || '管理员' }}</h1>
        <p class="hero-desc">这里展示平台的实时统计、待处理业务和近 {{ trendDays }} 天趋势，答辩时也比较适合直接演示。</p>
      </div>
      <div class="hero-actions">
        <el-radio-group v-model="trendDays" size="small" @change="loadTrends">
          <el-radio-button :value="7">近 7 天</el-radio-button>
          <el-radio-button :value="30">近 30 天</el-radio-button>
        </el-radio-group>
        <el-button @click="reloadAll">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <el-row :gutter="18" class="metric-grid">
      <el-col v-for="card in metricCards" :key="card.key" :xs="24" :sm="12" :lg="8" :xl="6">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-card-head">
            <span>{{ card.label }}</span>
            <strong>{{ card.hint }}</strong>
          </div>
          <el-statistic :value="card.value">
            <template #title>
              <span>{{ card.title }}</span>
            </template>
            <template v-if="card.prefix" #prefix>{{ card.prefix }}</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <div class="chart-section">
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="section-head">
            <div>
              <h3>新增用户与订单趋势</h3>
              <p>按创建时间聚合，用于展示平台活跃增长。</p>
            </div>
          </div>
        </template>

        <div class="chart-layout">
          <TrendChart
            title="新增用户"
            color="#4a76b8"
            fill="rgba(74, 118, 184, 0.14)"
            :labels="trendLabels"
            :values="trends.newUsers"
          />
          <TrendChart
            title="新增订单"
            color="#ea8c55"
            fill="rgba(234, 140, 85, 0.16)"
            :labels="trendLabels"
            :values="trends.newOrders"
          />
        </div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="section-head">
            <div>
              <h3>支付金额与业务申请趋势</h3>
              <p>同时观察成交金额、预约提交和领养申请的变化。</p>
            </div>
          </div>
        </template>

        <div class="chart-layout">
          <TrendChart
            title="支付金额"
            color="#2f9b69"
            fill="rgba(47, 155, 105, 0.16)"
            :labels="trendLabels"
            :values="paidAmountSeries"
            prefix="¥"
            value-type="money"
          />
          <TrendChart
            title="预约 / 领养申请"
            color="#7358c7"
            fill="rgba(115, 88, 199, 0.14)"
            :labels="trendLabels"
            :values="dualTrendValues"
            :secondary-values="trends.newAdoptionApplies"
            secondary-color="#d97745"
            secondary-fill="rgba(217, 119, 69, 0.12)"
            secondary-title="领养申请"
          />
        </div>
      </el-card>
    </div>

    <el-row :gutter="18" class="insight-row">
      <el-col :xs="24" :lg="12">
        <el-card class="insight-card" shadow="never">
          <template #header>
            <div class="section-head">
              <div>
                <h3>待处理事项</h3>
                <p>适合答辩时说明后台运营价值。</p>
              </div>
            </div>
          </template>

          <div class="todo-list">
            <div class="todo-item">
              <div>
                <strong>待审核领养</strong>
                <p>还有 {{ summary.pendingAdoptions || 0 }} 条申请等待管理员处理</p>
              </div>
              <el-tag type="warning" size="large">{{ summary.pendingAdoptions || 0 }}</el-tag>
            </div>
            <div class="todo-item">
              <div>
                <strong>待处理预约</strong>
                <p>还有 {{ summary.pendingAppointments || 0 }} 条预约处于待处理状态</p>
              </div>
              <el-tag type="primary" size="large">{{ summary.pendingAppointments || 0 }}</el-tag>
            </div>
            <div class="todo-item">
              <div>
                <strong>待支付订单</strong>
                <p>当前未支付订单共 {{ summary.unpaidOrdersTotal || 0 }} 条</p>
              </div>
              <el-tag type="danger" size="large">{{ summary.unpaidOrdersTotal || 0 }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="insight-card" shadow="never">
          <template #header>
            <div class="section-head">
              <div>
                <h3>平台活跃摘要</h3>
                <p>快速查看社区和订单侧的业务热度。</p>
              </div>
            </div>
          </template>

          <div class="summary-grid">
            <div class="summary-chip">
              <span>社区帖子</span>
              <strong>{{ summary.postTotal || 0 }}</strong>
            </div>
            <div class="summary-chip">
              <span>评论总数</span>
              <strong>{{ summary.commentTotal || 0 }}</strong>
            </div>
            <div class="summary-chip">
              <span>已支付订单</span>
              <strong>{{ summary.paidOrdersTotal || 0 }}</strong>
            </div>
            <div class="summary-chip">
              <span>今日成交额</span>
              <strong>¥{{ formatAmount(summary.todayPaidAmount) }}</strong>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { dashboardApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const trendDays = ref(7)

const summary = ref({
  userTotal: 0,
  petTotal: 0,
  ordersTotal: 0,
  paidOrdersTotal: 0,
  unpaidOrdersTotal: 0,
  todayAppointments: 0,
  pendingAppointments: 0,
  pendingAdoptions: 0,
  postTotal: 0,
  commentTotal: 0,
  todayPaidAmount: 0
})

const trends = ref({
  dates: [],
  newUsers: [],
  newOrders: [],
  paidAmount: [],
  newAppointments: [],
  newAdoptionApplies: []
})

const formatAmount = (value) => {
  const num = Number(value || 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

const metricCards = computed(() => [
  {
    key: 'users',
    title: '用户总数',
    label: '用户',
    hint: '累计注册',
    value: summary.value.userTotal || 0
  },
  {
    key: 'pets',
    title: '宠物数量',
    label: '宠物',
    hint: '平台档案',
    value: summary.value.petTotal || 0
  },
  {
    key: 'orders',
    title: '订单总数',
    label: '订单',
    hint: '全部订单',
    value: summary.value.ordersTotal || 0
  },
  {
    key: 'appointments',
    title: '今日预约',
    label: '预约',
    hint: '按预约时间',
    value: summary.value.todayAppointments || 0
  },
  {
    key: 'pendingAppointment',
    title: '待处理预约',
    label: '待办',
    hint: 'status = 已预约',
    value: summary.value.pendingAppointments || 0
  },
  {
    key: 'pendingAdoption',
    title: '待审核领养',
    label: '待办',
    hint: 'status = 待审核',
    value: summary.value.pendingAdoptions || 0
  },
  {
    key: 'paid',
    title: '今日成交额',
    label: '收入',
    hint: '已支付订单',
    value: Number(summary.value.todayPaidAmount || 0),
    prefix: '¥'
  },
  {
    key: 'community',
    title: '社区活跃度',
    label: '社区',
    hint: '帖子 + 评论',
    value: (summary.value.postTotal || 0) + (summary.value.commentTotal || 0)
  }
])

const trendLabels = computed(() =>
  (trends.value.dates || []).map((item) => {
    const [year, month, day] = item.split('-')
    return `${month}/${day}`
  })
)

const paidAmountSeries = computed(() =>
  (trends.value.paidAmount || []).map((item) => Number(item || 0))
)

const dualTrendValues = computed(() => trends.value.newAppointments || [])

const loadSummary = async () => {
  const res = await dashboardApi.getDashboardSummary()
  if (res.code === 200) {
    summary.value = { ...summary.value, ...(res.data || {}) }
    return
  }
  throw new Error(res.message || '汇总数据加载失败')
}

const loadTrends = async () => {
  const res = await dashboardApi.getDashboardTrends(trendDays.value)
  if (res.code === 200) {
    trends.value = {
      dates: [],
      newUsers: [],
      newOrders: [],
      paidAmount: [],
      newAppointments: [],
      newAdoptionApplies: [],
      ...(res.data || {})
    }
    return
  }
  throw new Error(res.message || '趋势数据加载失败')
}

const reloadAll = async () => {
  loading.value = true
  try {
    await Promise.all([loadSummary(), loadTrends()])
  } catch (error) {
    console.error(error)
    ElMessage.error(error.message || '仪表盘数据加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  reloadAll()
})

const TrendChart = defineComponent({
  name: 'TrendChart',
  props: {
    title: { type: String, required: true },
    labels: { type: Array, default: () => [] },
    values: { type: Array, default: () => [] },
    secondaryValues: { type: Array, default: () => [] },
    color: { type: String, default: '#4a76b8' },
    fill: { type: String, default: 'rgba(74, 118, 184, 0.14)' },
    secondaryColor: { type: String, default: '#d97745' },
    secondaryFill: { type: String, default: 'rgba(217, 119, 69, 0.12)' },
    secondaryTitle: { type: String, default: '' },
    prefix: { type: String, default: '' },
    valueType: { type: String, default: 'count' }
  },
  setup(props) {
    const width = 420
    const height = 190
    const padding = 20

    const normalizeValues = (arr) => arr.map((item) => Number(item || 0))

    const allValues = computed(() => {
      const primary = normalizeValues(props.values)
      const secondary = normalizeValues(props.secondaryValues)
      return [...primary, ...secondary]
    })

    const maxValue = computed(() => {
      const vals = allValues.value
      const max = Math.max(...vals, 0)
      return max <= 0 ? 1 : max
    })

    const buildPath = (sourceValues) => {
      const values = normalizeValues(sourceValues)
      if (!values.length) return ''
      if (values.length === 1) {
        const x = width / 2
        const y = height - padding - (values[0] / maxValue.value) * (height - padding * 2)
        return `${x},${y}`
      }
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2
      return values
        .map((value, index) => {
          const x = padding + (chartWidth / (values.length - 1)) * index
          const y = height - padding - (value / maxValue.value) * chartHeight
          return `${x},${y}`
        })
        .join(' ')
    }

    const buildFillPath = (sourceValues) => {
      const line = buildPath(sourceValues)
      if (!line) return ''
      const firstX = line.split(' ')[0]?.split(',')[0] || padding
      const lastPoint = line.split(' ').at(-1) || `${width - padding},${height - padding}`
      const lastX = lastPoint.split(',')[0]
      return `${firstX},${height - padding} ${line} ${lastX},${height - padding}`
    }

    const topValue = computed(() => {
      const raw = maxValue.value
      return props.valueType === 'money' ? `${props.prefix}${raw.toFixed(0)}` : `${raw}`
    })

    const currentValue = computed(() => {
      const current = Number(props.values?.[props.values.length - 1] || 0)
      return props.valueType === 'money'
        ? `${props.prefix}${current.toFixed(2)}`
        : `${props.prefix}${current}`
    })

    return () =>
      h('div', { class: 'mini-chart' }, [
        h('div', { class: 'mini-chart-head' }, [
          h('div', {}, [
            h('h4', props.title),
            props.secondaryTitle ? h('p', `${props.title} / ${props.secondaryTitle}`) : h('p', `最近 ${props.labels.length} 个统计点`)
          ]),
          h('strong', currentValue.value)
        ]),
        h('div', { class: 'mini-chart-svg-wrap' }, [
          h('div', { class: 'chart-y-mark chart-y-top' }, topValue.value),
          h('div', { class: 'chart-y-mark chart-y-bottom' }, props.valueType === 'money' ? `${props.prefix}0` : '0'),
          h(
            'svg',
            { viewBox: `0 0 ${width} ${height}`, class: 'mini-chart-svg', preserveAspectRatio: 'none' },
            [
              h('line', {
                x1: padding,
                y1: height - padding,
                x2: width - padding,
                y2: height - padding,
                stroke: '#d9e2f0',
                'stroke-width': 1
              }),
              h('line', {
                x1: padding,
                y1: padding,
                x2: padding,
                y2: height - padding,
                stroke: '#eef2f8',
                'stroke-width': 1
              }),
              buildFillPath(props.values)
                ? h('polygon', {
                    points: buildFillPath(props.values),
                    fill: props.fill
                  })
                : null,
              buildPath(props.values)
                ? h('polyline', {
                    points: buildPath(props.values),
                    fill: 'none',
                    stroke: props.color,
                    'stroke-width': 3,
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                  })
                : null,
              props.secondaryValues?.length
                ? h('polyline', {
                    points: buildPath(props.secondaryValues),
                    fill: 'none',
                    stroke: props.secondaryColor,
                    'stroke-width': 2.5,
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-dasharray': '4 4'
                  })
                : null
            ].filter(Boolean)
          )
        ]),
        h(
          'div',
          { class: 'mini-chart-labels' },
          props.labels.map((label, index) =>
            h('span', { key: `${label}-${index}` }, index % Math.ceil(props.labels.length / 6 || 1) === 0 || index === props.labels.length - 1 ? label : '')
          )
        )
      ])
  }
})
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 22px;
  background:
    radial-gradient(circle at right top, rgba(83, 121, 182, 0.16), transparent 34%),
    linear-gradient(135deg, #ffffff, #f5f8fd);
  border: 1px solid rgba(83, 121, 182, 0.12);
}

.hero-kicker {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #5f7cae;
  text-transform: uppercase;
}

.dashboard-hero h1 {
  margin: 0 0 10px;
  font-size: 30px;
  color: #24344a;
}

.hero-desc {
  margin: 0;
  max-width: 720px;
  color: #69788f;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.metric-grid {
  margin-top: 0;
}

.metric-card {
  border: none;
  min-height: 128px;
}

.metric-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  color: #6d7c92;
  font-size: 13px;
}

.metric-card-head strong {
  color: #44679f;
  font-size: 12px;
}

.chart-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.chart-card,
.insight-card {
  border: none;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.section-head h3 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #24344a;
}

.section-head p {
  margin: 0;
  color: #7b8799;
  line-height: 1.6;
}

.chart-layout {
  display: grid;
  gap: 16px;
}

.mini-chart {
  border-radius: 18px;
  background: linear-gradient(180deg, #fbfcfe, #f4f7fb);
  border: 1px solid #e6edf7;
  padding: 16px;
}

.mini-chart-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.mini-chart-head h4 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #283a51;
}

.mini-chart-head p {
  margin: 0;
  font-size: 12px;
  color: #7a8798;
}

.mini-chart-head strong {
  color: #345487;
  font-size: 24px;
}

.mini-chart-svg-wrap {
  position: relative;
}

.mini-chart-svg {
  width: 100%;
  height: 190px;
  display: block;
}

.chart-y-mark {
  position: absolute;
  left: 0;
  font-size: 11px;
  color: #90a0b5;
}

.chart-y-top {
  top: -2px;
}

.chart-y-bottom {
  bottom: -2px;
}

.mini-chart-labels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(24px, 1fr));
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
  color: #90a0b5;
}

.mini-chart-labels span {
  text-align: center;
}

.insight-row {
  margin-top: 0;
}

.todo-list {
  display: grid;
  gap: 14px;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid #e9eef6;
  border-radius: 16px;
  background: #f9fbff;
}

.todo-item strong {
  display: block;
  margin-bottom: 6px;
  color: #24344a;
}

.todo-item p {
  margin: 0;
  color: #75859c;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.summary-chip {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fbff, #f3f6fb);
  border: 1px solid #e7edf7;
}

.summary-chip span {
  display: block;
  margin-bottom: 10px;
  color: #7c8aa0;
  font-size: 13px;
}

.summary-chip strong {
  color: #294168;
  font-size: 28px;
}

@media (max-width: 1200px) {
  .chart-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .dashboard-hero {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-hero {
    padding: 20px;
  }

  .dashboard-hero h1 {
    font-size: 24px;
  }
}
</style>

