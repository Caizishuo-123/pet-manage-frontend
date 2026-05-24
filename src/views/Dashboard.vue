<template>
  <div class="dashboard" v-loading="loading" element-loading-background="rgba(15,23,36,0.8)">
    <!-- 顶部欢迎栏 -->
    <div class="welcome-banner">
      <div class="welcome-left">
        <h1>👋 欢迎回来，{{ userStore.username || '管理员' }}</h1>
        <p class="welcome-date">{{ todayText }} · 数据更新于 {{ lastUpdatedText }}</p>
      </div>
      <div class="welcome-right">
        <div class="mini-stats">
          <div class="mini-stat" v-for="item in miniStats" :key="item.label">
            <span class="mini-label">{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
        <el-button class="refresh-btn" @click="reloadAll" :icon="Refresh" circle />
      </div>
    </div>

    <!-- 指标卡片 -->
    <el-row :gutter="16" class="card-row">
      <el-col v-for="card in statCards" :key="card.key" :xs="12" :sm="8" :lg="6" :xl="3">
        <div class="stat-card" :class="{ clickable: !!card.route }" @click="handleNav(card)">
          <div class="stat-icon" :style="{ background: card.gradient }">{{ card.icon }}</div>
          <div class="stat-info">
            <span class="stat-title">{{ card.title }}</span>
            <strong class="stat-value">{{ card.value }}</strong>
            <span class="stat-desc">{{ card.desc }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="16">
        <div class="glass-panel trend-panel">
          <div class="panel-header">
            <div>
              <h3>📊 数据趋势</h3>
              <p>{{ trendDays }} 天内按日统计，空日期自动补 0</p>
            </div>
            <div class="trend-controls">
              <el-radio-group v-model="trendDays" size="small" @change="loadTrends">
                <el-radio-button :value="7">7 天</el-radio-button>
                <el-radio-button :value="30">30 天</el-radio-button>
              </el-radio-group>
              <el-radio-group v-model="activeTrendMetric" size="small">
                <el-radio-button v-for="m in trendMetrics" :key="m.key" :value="m.key">{{ m.label }}</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="trend-summary-row">
            <div class="trend-stat-chip" v-for="s in trendSummaryChips" :key="s.label">
              <span>{{ s.label }}</span>
              <strong>{{ s.value }}</strong>
            </div>
          </div>
          <div ref="trendChartRef" class="chart-box trend-chart"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="glass-panel pie-panel">
          <div class="panel-header"><h3>🐾 宠物状态分布</h3></div>
          <div ref="petPieRef" class="chart-box pie-chart"></div>
        </div>
        <div class="glass-panel pie-panel">
          <div class="panel-header"><h3>🔥 服务预约排行</h3></div>
          <div ref="servicePieRef" class="chart-box pie-chart"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 排行 + 待办 + 今日预约 -->
    <el-row :gutter="16" class="info-row">
      <el-col :xs="24" :lg="8">
        <div class="glass-panel">
          <div class="panel-header"><h3>🏆 热门服务 TOP5</h3></div>
          <div v-if="summary.hotServices.length" class="rank-list">
            <div v-for="(item, i) in summary.hotServices" :key="item.id" class="rank-item" @click="handleNav(item)">
              <span class="rank-badge" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
              <div class="rank-info">
                <strong>{{ item.name }}</strong>
                <span>{{ item.extra }}</span>
              </div>
              <div class="rank-val">
                <strong>{{ item.value }}</strong>
                <el-tag size="small" :type="item.status === '禁用' ? 'danger' : 'success'" effect="dark">{{ item.status }}</el-tag>
              </div>
            </div>
          </div>
          <div v-else class="empty">暂无服务排行</div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="glass-panel">
          <div class="panel-header"><h3>💬 热门帖子 TOP5</h3></div>
          <div v-if="summary.hotPosts.length" class="rank-list">
            <div v-for="(item, i) in summary.hotPosts" :key="item.id" class="rank-item" @click="handleNav(item)">
              <span class="rank-badge" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
              <div class="rank-info">
                <strong>{{ item.name }}</strong>
                <span>{{ item.extra }}</span>
              </div>
              <div class="rank-val">
                <strong>{{ item.value }}</strong>
                <el-tag size="small" :type="item.status === '屏蔽' ? 'danger' : 'success'" effect="dark">{{ item.status }}</el-tag>
              </div>
            </div>
          </div>
          <div v-else class="empty">暂无帖子排行</div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="glass-panel">
          <div class="panel-header"><h3>📅 今日预约</h3></div>
          <div v-if="summary.todaySchedules.length" class="schedule-list">
            <div v-for="s in summary.todaySchedules" :key="s.id" class="schedule-row">
              <span class="schedule-time">{{ fmtTime(s.appointmentTime) }}</span>
              <div class="schedule-info">
                <strong>{{ s.serviceName }}</strong>
                <span>{{ s.userName }} · {{ s.petName }}</span>
              </div>
              <el-tag size="small" :type="s.statusType || 'info'" effect="dark">{{ s.statusLabel }}</el-tag>
            </div>
          </div>
          <div v-else class="empty">今天还没有预约</div>
        </div>
      </el-col>
    </el-row>

    <!-- 待办事项 + 最近动态 -->
    <el-row :gutter="16" class="bottom-row">
      <el-col :xs="24" :lg="10">
        <div ref="todoPanelRef" class="glass-panel todo-panel">
          <div class="panel-header"><h3>📋 待办事项</h3></div>
          <div v-if="summary.todos.length" class="todo-list">
            <div v-for="t in summary.todos" :key="t.label" class="todo-row" @click="handleNav(t)">
              <div class="todo-info">
                <strong>{{ t.label }}</strong>
                <span>{{ t.extra || '点击查看' }}</span>
              </div>
              <div class="todo-right">
                <strong class="todo-count">{{ t.value }}</strong>
                <el-tag :type="t.statusType || 'info'" size="small" effect="dark">待处理</el-tag>
              </div>
            </div>
          </div>
          <div v-else class="empty">暂无待办</div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="14">
        <div ref="activityPanelRef" class="glass-panel activity-panel">
          <div class="panel-header activity-header">
            <h3>🕐 最近动态</h3>
            <el-checkbox-group v-model="activityTypes" size="small">
              <el-checkbox-button v-for="at in activityTypeOptions" :key="at.key" :value="at.key">{{ at.label }}</el-checkbox-button>
            </el-checkbox-group>
          </div>
          <div v-if="filteredActivities.length" class="activity-scroll">
            <el-scrollbar class="activity-scrollbar">
              <el-timeline>
                <el-timeline-item v-for="(a, i) in filteredActivities" :key="i" :color="getActColor(a.type)">
                  <div class="act-item">
                    <div class="act-top">
                      <span class="act-type-badge" :style="{ background: getActBg(a.type), color: getActColor(a.type) }">{{ getActLabel(a.type) }}</span>
                      <strong>{{ a.title }}</strong>
                      <el-tag v-if="a.statusLabel" :type="a.statusType || 'info'" size="small" effect="dark">{{ a.statusLabel }}</el-tag>
                    </div>
                    <p>{{ a.description }}</p>
                    <span class="act-time">{{ fmtDate(a.time) }}</span>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </el-scrollbar>
          </div>
          <div v-else class="empty">暂无动态</div>
        </div>
      </el-col>
    </el-row>

    <!-- 状态分布条 -->
    <el-row :gutter="16" class="dist-row">
      <el-col v-for="dp in distPanels" :key="dp.key" :xs="24" :sm="12" :lg="6">
        <div class="glass-panel dist-panel">
          <div class="panel-header"><h3>{{ dp.title }}</h3></div>
          <div class="dist-list">
            <div v-for="item in dp.items" :key="item.label" class="dist-item">
              <div class="dist-row-head"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div>
              <el-progress :show-text="false" :stroke-width="6" :percentage="item.percent" :color="dp.color" />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { dashboardApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const lastUpdatedAt = ref(null)
const activityTypes = ref(['order', 'appointment', 'adoption', 'post'])
const trendDays = ref(7)
const activeTrendMetric = ref('newUsers')
const trendChartRef = ref(null)
const petPieRef = ref(null)
const servicePieRef = ref(null)
const todoPanelRef = ref(null)
const activityPanelRef = ref(null)
let trendChart = null
let petPieChart = null
let servicePieChart = null
let todoPanelObserver = null

const mkEmpty = () => ({
  userTotal: 0, petTotal: 0, ordersTotal: 0, paidOrdersTotal: 0, unpaidOrdersTotal: 0,
  todayAppointments: 0, pendingAppointments: 0, pendingAdoptions: 0,
  appointmentTotal: 0, appointmentCompletedTotal: 0, appointmentCanceledTotal: 0,
  adoptionTotal: 0, adoptionApprovedTotal: 0, adoptionRejectedTotal: 0, adoptionCompletedTotal: 0,
  postTotal: 0, commentTotal: 0, todayPaidAmount: 0, adoptablePetTotal: 0,
  pendingPetReviewTotal: 0, blockedPetTotal: 0, blockedPostTotal: 0, blockedCommentTotal: 0,
  disabledUserTotal: 0, enabledServiceTotal: 0, disabledServiceTotal: 0,
  todayNewUsers: 0, todayNewOrders: 0,
  todos: [], todaySchedules: [], hotServices: [], hotPosts: [],
  petStatusDistribution: [], appointmentStatusDistribution: [],
  adoptionStatusDistribution: [], communityStatusDistribution: []
})
const mkEmptyTrends = () => ({ dates: [], newUsers: [], newOrders: [], paidAmount: [], newAppointments: [], newAdoptionApplies: [] })

const summary = ref(mkEmpty())
const trends = ref(mkEmptyTrends())
const activities = ref([])

const trendMetrics = [
  { key: 'newUsers', label: '用户', color: '#3b82f6', type: 'line' },
  { key: 'newOrders', label: '订单', color: '#f59e0b', type: 'bar' },
  { key: 'paidAmount', label: '金额', color: '#10b981', type: 'line', amt: true },
  { key: 'newAppointments', label: '预约', color: '#8b5cf6', type: 'bar' },
  { key: 'newAdoptionApplies', label: '领养', color: '#ec4899', type: 'bar' }
]
const activityTypeOptions = [
  { key: 'order', label: '订单' }, { key: 'appointment', label: '预约' },
  { key: 'adoption', label: '领养' }, { key: 'post', label: '社区' }
]
const actMeta = {
  order: { label: '订单', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  appointment: { label: '预约', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  adoption: { label: '领养', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  post: { label: '社区', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' }
}

const curMetric = computed(() => trendMetrics.find(m => m.key === activeTrendMetric.value) || trendMetrics[0])
const curValues = computed(() => (trends.value[activeTrendMetric.value] || []).map(v => Number(v || 0)))
const trendTotal = computed(() => curValues.value.reduce((s, v) => s + v, 0))
const trendMax = computed(() => curValues.value.length ? Math.max(...curValues.value) : 0)
const trendAvg = computed(() => curValues.value.length ? trendTotal.value / curValues.value.length : 0)

const fmtAmt = v => { const n = Number(v || 0); return Number.isFinite(n) ? n.toFixed(2) : '0.00' }
const fmtVal = (v, m) => m.amt ? `¥${fmtAmt(v)}` : `${Math.round(v || 0)}`

const trendSummaryChips = computed(() => [
  { label: '累计', value: fmtVal(trendTotal.value, curMetric.value) },
  { label: '峰值', value: fmtVal(trendMax.value, curMetric.value) },
  { label: '日均', value: fmtVal(trendAvg.value, curMetric.value) }
])

const todayText = computed(() => {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`
})
const lastUpdatedText = computed(() => lastUpdatedAt.value ? fmtDate(lastUpdatedAt.value) : '暂未更新')

const miniStats = computed(() => [
  { label: '今日新用户', value: summary.value.todayNewUsers || 0 },
  { label: '今日订单', value: summary.value.todayNewOrders || 0 },
  { label: '今日成交', value: `¥${fmtAmt(summary.value.todayPaidAmount)}` },
  { label: '今日预约', value: summary.value.todayAppointments || 0 }
])

const blockedTotal = computed(() => Number(summary.value.blockedPostTotal || 0) + Number(summary.value.blockedCommentTotal || 0))
const statCards = computed(() => [
  { key: 'u', title: '累计用户', icon: '👥', value: summary.value.userTotal || 0, desc: `今日+${summary.value.todayNewUsers || 0}`, gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', route: '/users' },
  { key: 'p', title: '可领养宠物', icon: '🐾', value: summary.value.adoptablePetTotal || 0, desc: `总宠物 ${summary.value.petTotal || 0}`, gradient: 'linear-gradient(135deg,#10b981,#34d399)', route: '/pet' },
  { key: 'o', title: '未支付订单', icon: '💳', value: summary.value.unpaidOrdersTotal || 0, desc: `累计 ${summary.value.ordersTotal || 0} 单`, gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', route: '/orders' },
  { key: 'ad', title: '待审核领养', icon: '🏠', value: summary.value.pendingAdoptions || 0, desc: `已完成 ${summary.value.adoptionCompletedTotal || 0}`, gradient: 'linear-gradient(135deg,#ec4899,#f472b6)', route: '/adoption' },
  { key: 'ap', title: '待处理预约', icon: '📅', value: summary.value.pendingAppointments || 0, desc: `总预约 ${summary.value.appointmentTotal || 0}`, gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', route: '/appointment' },
  { key: 'ta', title: '今日预约', icon: '⏰', value: summary.value.todayAppointments || 0, desc: `预约总量 ${summary.value.appointmentTotal || 0}`, gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', route: '/appointment' },
  { key: 'b', title: '屏蔽内容', icon: '🛡️', value: blockedTotal.value, desc: `帖${summary.value.blockedPostTotal || 0}/评${summary.value.blockedCommentTotal || 0}`, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', route: '/community' },
  { key: 's', title: '服务状态', icon: '⚙️', value: `${summary.value.enabledServiceTotal || 0}/${summary.value.disabledServiceTotal || 0}`, desc: '启用/禁用', gradient: 'linear-gradient(135deg,#6366f1,#818cf8)', route: '/pet-service' }
])

const filteredActivities = computed(() => {
  const s = new Set(activityTypes.value)
  return (activities.value || []).filter(a => s.has(a.type))
})

const distPanels = computed(() => [
  buildDist('pet', '🐱 宠物状态', summary.value.petStatusDistribution, '#3b82f6'),
  buildDist('appt', '📅 预约状态', summary.value.appointmentStatusDistribution, '#8b5cf6'),
  buildDist('adopt', '🏠 领养状态', summary.value.adoptionStatusDistribution, '#f59e0b'),
  buildDist('comm', '💬 社区状态', summary.value.communityStatusDistribution, '#10b981')
])

function buildDist(key, title, items, color) {
  const list = (items || []).map(i => ({ label: i.label, value: Number(i.value || 0) }))
  const total = list.reduce((s, i) => s + i.value, 0)
  return { key, title, color, items: list.map(i => ({ ...i, percent: total ? Math.round(i.value / total * 100) : 0 })) }
}

const getActColor = t => actMeta[t]?.color || '#94a3b8'
const getActBg = t => actMeta[t]?.bg || 'rgba(148,163,184,0.15)'
const getActLabel = t => actMeta[t]?.label || '其他'

function fmtDate(v) {
  if (!v) return '-'
  const d = new Date(v)
  if (isNaN(d.getTime())) return String(v)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
function fmtTime(v) {
  if (!v) return '-'
  const d = new Date(v)
  if (isNaN(d.getTime())) return String(v)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function handleNav(t) {
  if (t?.route) router.push({ path: t.route, query: t.query || {} })
}

function norm(data) {
  const m = { ...mkEmpty(), ...(data || {}) }
  for (const k of ['todos', 'todaySchedules', 'hotServices', 'hotPosts', 'petStatusDistribution', 'appointmentStatusDistribution', 'adoptionStatusDistribution', 'communityStatusDistribution']) {
    if (!Array.isArray(m[k])) m[k] = []
  }
  return m
}

/* ---- Charts ---- */
const lightAxisStyle = { axisLine: { lineStyle: { color: '#e5e7eb' } }, axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } }

function renderTrend() {
  if (!trendChart && trendChartRef.value) trendChart = echarts.init(trendChartRef.value)
  if (!trendChart) return
  const m = curMetric.value
  trendChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e5e7eb', textStyle: { color: '#1f2937' }, formatter: p => p?.[0] ? `${p[0].axisValue}<br/>${m.label}：${fmtVal(p[0].value, m)}` : '' },
    grid: { left: 16, right: 16, top: 20, bottom: 28, containLabel: true },
    xAxis: { type: 'category', data: trends.value.dates || [], ...lightAxisStyle },
    yAxis: { type: 'value', axisLine: { show: false }, ...lightAxisStyle, axisLabel: { ...lightAxisStyle.axisLabel, formatter: v => m.amt ? `¥${v}` : v } },
    series: [{ type: m.type, smooth: m.type === 'line', data: curValues.value, symbol: 'circle', symbolSize: 7, lineStyle: { width: 3, color: m.color }, areaStyle: m.type === 'line' ? { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: m.color + '30' }, { offset: 1, color: m.color + '05' }]) } : undefined, itemStyle: { color: m.color }, barMaxWidth: 24 }]
  }, true)
}

function renderPetPie() {
  if (!petPieChart && petPieRef.value) petPieChart = echarts.init(petPieRef.value)
  if (!petPieChart) return
  const items = summary.value.petStatusDistribution || []
  petPieChart.setOption({
    tooltip: { backgroundColor: '#fff', borderColor: '#e5e7eb', textStyle: { color: '#1f2937' } },
    legend: { type: 'scroll', bottom: 0, left: 'center', textStyle: { color: '#6b7280', fontSize: 11 } },
    series: [{ type: 'pie', radius: ['38%', '66%'], center: ['50%', '38%'], data: items.map(i => ({ name: i.label, value: Number(i.value || 0) })), label: { show: false }, emphasis: { label: { show: true, color: '#1f2937' } }, itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }, color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'] }]
  }, true)
}

function renderServicePie() {
  if (!servicePieChart && servicePieRef.value) servicePieChart = echarts.init(servicePieRef.value)
  if (!servicePieChart) return
  const items = summary.value.hotServices || []
  servicePieChart.setOption({
    tooltip: { backgroundColor: '#fff', borderColor: '#e5e7eb', textStyle: { color: '#1f2937' } },
    legend: { type: 'scroll', bottom: 0, left: 'center', textStyle: { color: '#6b7280', fontSize: 11 } },
    series: [{ type: 'pie', radius: ['38%', '66%'], center: ['50%', '38%'], data: items.map(i => ({ name: i.name, value: Number(i.value || 0) })), label: { show: false }, emphasis: { label: { show: true, color: '#1f2937' } }, itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }, color: ['#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#6366f1'] }]
  }, true)
}

async function loadSummary() {
  const res = await dashboardApi.getDashboardSummary()
  if (res.code === 200) { summary.value = norm(res.data); return }
  throw new Error(res.msg || '汇总加载失败')
}
async function loadTrends() {
  const res = await dashboardApi.getDashboardTrends(trendDays.value)
  if (res.code === 200) { trends.value = { ...mkEmptyTrends(), ...(res.data || {}) }; await nextTick(); renderTrend(); return }
  throw new Error(res.msg || '趋势加载失败')
}
async function loadActivities() {
  const res = await dashboardApi.getDashboardActivities(12)
  if (res.code === 200) { activities.value = Array.isArray(res.data) ? res.data : []; return }
  throw new Error(res.msg || '动态加载失败')
}
async function reloadAll() {
  loading.value = true
  try {
    await Promise.all([loadSummary(), loadTrends(), loadActivities()])
    lastUpdatedAt.value = new Date()
    await nextTick()
    renderPetPie()
    renderServicePie()
    handleResize()
  } catch (e) { console.error(e); ElMessage.error(e.message || '加载失败') }
  finally { loading.value = false }
}

watch(activeTrendMetric, async () => { await nextTick(); renderTrend() })

function handleResize() {
  syncBottomPanelsHeight()
  trendChart?.resize()
  petPieChart?.resize()
  servicePieChart?.resize()
}

function syncBottomPanelsHeight() {
  if (!todoPanelRef.value || !activityPanelRef.value) return

  if (window.innerWidth < 1200) {
    activityPanelRef.value.style.height = 'auto'
    return
  }

  const todoHeight = todoPanelRef.value.offsetHeight
  if (todoHeight > 0) {
    activityPanelRef.value.style.height = `${todoHeight}px`
  }
}

onMounted(async () => {
  await reloadAll()
  await nextTick()
  syncBottomPanelsHeight()
  if (typeof ResizeObserver !== 'undefined' && todoPanelRef.value) {
    todoPanelObserver = new ResizeObserver(() => syncBottomPanelsHeight())
    todoPanelObserver.observe(todoPanelRef.value)
  }
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  todoPanelObserver?.disconnect()
  trendChart?.dispose(); petPieChart?.dispose(); servicePieChart?.dispose()
  trendChart = petPieChart = servicePieChart = null
  todoPanelObserver = null
})
</script>

<style scoped>
.dashboard {
  --chart-panel-gap: 16px;
  --pie-panel-height: 280px;
  display: flex; flex-direction: column; gap: 16px;
  min-height: calc(100vh - 60px); padding: 24px;
  margin: -20px;
  background: #f0f2f5;
  color: #1f2937;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ---- Welcome Banner ---- */
.welcome-banner {
  display: flex; justify-content: space-between; align-items: center; gap: 24px;
  padding: 28px 32px; border-radius: 20px;
  background: linear-gradient(135deg, #4a76b8, #6366f1);
  border: none;
  box-shadow: 0 8px 24px rgba(74,118,184,0.25);
}
.welcome-banner h1 { margin: 0 0 8px; font-size: 26px; font-weight: 700; color: #fff; }
.welcome-date { margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; }
.welcome-right { display: flex; align-items: center; gap: 20px; }
.mini-stats { display: flex; gap: 20px; }
.mini-stat { text-align: center; }
.mini-label { display: block; font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
.mini-stat strong { font-size: 20px; color: #fff; }
.refresh-btn { background: rgba(255,255,255,0.2) !important; border: 1px solid rgba(255,255,255,0.3) !important; color: #fff !important; }
.refresh-btn:hover { background: rgba(255,255,255,0.35) !important; }

/* ---- Stat Cards ---- */
.card-row { margin-bottom: 0; }
.stat-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 16px; border-radius: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}
.stat-card.clickable { cursor: pointer; }
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.08); }
.stat-icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.stat-info { flex: 1; min-width: 0; }
.stat-title { display: block; font-size: 12px; color: #9ca3af; margin-bottom: 6px; }
.stat-value { display: block; font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
.stat-desc { display: block; font-size: 11px; color: #9ca3af; }

/* ---- Glass Panel ---- */
.glass-panel {
  padding: 22px; border-radius: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.panel-header h3 { margin: 0; font-size: 16px; color: #1f2937; font-weight: 600; }
.panel-header p { margin: 4px 0 0; font-size: 12px; color: #9ca3af; }

/* ---- Trend ---- */
.trend-controls { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.trend-summary-row { display: flex; gap: 12px; margin-bottom: 14px; }
.trend-stat-chip {
  flex: 1; padding: 12px 14px; border-radius: 12px;
  background: #f9fafb; border: 1px solid #e5e7eb;
}
.trend-stat-chip span { display: block; font-size: 11px; color: #9ca3af; }
.trend-stat-chip strong { display: block; margin-top: 6px; font-size: 18px; color: #1f2937; }

/* ---- Pie ---- */
.pie-panel { margin-bottom: 0; }
.chart-row .glass-panel { min-height: 200px; }
.chart-row.el-row { align-items: stretch; }
.chart-row > .el-col { display: flex; flex-direction: column; }
.chart-row > .el-col > .glass-panel { display: flex; flex-direction: column; height: 100%; }
.chart-row > .el-col:last-child { gap: var(--chart-panel-gap); }
.trend-panel {
  min-height: calc(var(--pie-panel-height) * 2 + var(--chart-panel-gap));
  height: calc(var(--pie-panel-height) * 2 + var(--chart-panel-gap));
}
.trend-chart {
  flex: 1;
  min-height: 280px;
}
.pie-panel {
  min-height: var(--pie-panel-height);
}
.pie-chart {
  height: 240px;
  min-height: 240px;
}

/* ---- Shared stretch rows ---- */
.info-row.el-row,
.bottom-row.el-row,
.dist-row.el-row {
  align-items: stretch;
}
.info-row > .el-col,
.bottom-row > .el-col,
.dist-row > .el-col {
  display: flex;
  flex-direction: column;
}
.info-row > .el-col > .glass-panel,
.bottom-row > .el-col > .glass-panel,
.dist-row > .el-col > .glass-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ---- Rank ---- */
.rank-list { display: flex; flex: 1; flex-direction: column; gap: 10px; }
.rank-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  background: #f9fafb; border: 1px solid #f3f4f6;
  cursor: pointer; transition: all .25s;
}
.rank-item:hover { background: #f3f4f6; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
.rank-badge {
  width: 30px; height: 30px; border-radius: 10px;
  background: #e5e7eb; color: #6b7280;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; flex-shrink: 0;
}
.rank-1 { background: linear-gradient(135deg,#f59e0b,#fbbf24); color: #fff; }
.rank-2 { background: linear-gradient(135deg,#94a3b8,#cbd5e1); color: #1e293b; }
.rank-3 { background: linear-gradient(135deg,#b45309,#d97706); color: #fff; }
.rank-info { flex: 1; min-width: 0; }
.rank-info strong { display: block; font-size: 13px; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rank-info span { font-size: 11px; color: #9ca3af; }
.rank-val { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.rank-val strong { font-size: 18px; color: #1f2937; }

/* ---- Schedule ---- */
.schedule-list { display: flex; flex: 1; flex-direction: column; gap: 10px; }
.schedule-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid #f3f4f6;
}
.schedule-row:last-child { border-bottom: none; }
.schedule-time { font-size: 18px; font-weight: 700; color: #3b82f6; width: 50px; flex-shrink: 0; }
.schedule-info { flex: 1; }
.schedule-info strong { display: block; font-size: 13px; color: #1f2937; }
.schedule-info span { font-size: 11px; color: #9ca3af; }

/* ---- Todo ---- */
.todo-list { display: flex; flex: 1; flex-direction: column; gap: 10px; }
.todo-row {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: 12px;
  background: #f9fafb; border: 1px solid #f3f4f6;
  cursor: pointer; transition: all .25s;
}
.todo-row:hover { background: #f3f4f6; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
.todo-info strong { display: block; color: #1f2937; font-size: 13px; }
.todo-info span { font-size: 11px; color: #9ca3af; }
.todo-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.todo-count { font-size: 22px; color: #1f2937; }

/* ---- Activity ---- */
.activity-panel { overflow: hidden; min-height: 0; }
.activity-header { align-items: center; }
.activity-scroll { flex: 1; min-height: 0; }
.act-item p { margin: 4px 0 0; font-size: 12px; color: #6b7280; }
.act-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.act-top strong { color: #1f2937; font-size: 13px; }
.act-type-badge { padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.act-time { display: block; margin-top: 4px; color: #9ca3af; font-size: 11px; }
:deep(.activity-scrollbar) { height: 100%; }
:deep(.activity-scrollbar .el-scrollbar__wrap) { overflow-x: hidden; }

/* ---- Distribution ---- */
.dist-panel { min-height: 120px; }
.dist-list { display: flex; flex: 1; flex-direction: column; gap: 10px; }
.dist-row-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
.dist-row-head span { color: #6b7280; font-size: 12px; }
.dist-row-head strong { color: #1f2937; font-size: 13px; }

/* ---- Empty ---- */
.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

/* ---- Responsive ---- */
@media (max-width: 960px) {
  .dashboard {
    --pie-panel-height: 260px;
  }
  .welcome-banner { flex-direction: column; align-items: flex-start; padding: 20px; }
  .welcome-right { flex-direction: column; align-items: flex-start; }
  .trend-controls { align-items: flex-start; }
  .activity-header { flex-direction: column; align-items: flex-start !important; gap: 8px; }
  .trend-panel {
    min-height: auto;
    height: auto;
  }
  .pie-chart {
    height: 220px;
    min-height: 220px;
  }
}
@media (max-width: 640px) {
  .dashboard { padding: 12px; }
  .welcome-banner h1 { font-size: 20px; }
  .mini-stats { flex-wrap: wrap; gap: 12px; }
  .trend-summary-row { flex-direction: column; }
}

/* ---- Element Plus overrides ---- */
:deep(.el-radio-group) { --el-color-primary: #3b82f6; }
:deep(.el-timeline-item__tail) { border-left-color: #e5e7eb; }
:deep(.el-progress-bar__outer) { background: #f3f4f6 !important; }
</style>
