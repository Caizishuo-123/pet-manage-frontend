<template>
  <div class="adoption-container">
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>领养申请列表</span>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="用户ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="宠物ID">
          <el-input v-model="searchForm.petId" placeholder="宠物ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="理由/地址/电话" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 110px">
            <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="Number(value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="70" align="center" />

        <el-table-column prop="username" label="申请用户" width="100" />

        <el-table-column prop="petName" label="申请宠物" min-width="110" />

        <el-table-column prop="applyReason" label="申请理由" min-width="160" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.applyReason || '-' }}</template>
        </el-table-column>

        <el-table-column prop="deliveryType" label="领取方式" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.deliveryType === 1 ? 'info' : 'primary'" effect="plain">
              {{ deliveryTypeMap[scope.row.deliveryType] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="address" label="送达地址" min-width="160" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.address || '-' }}</template>
        </el-table-column>

        <el-table-column prop="contactPhone" label="联系电话" width="120">
          <template #default="scope">{{ scope.row.contactPhone || '-' }}</template>
        </el-table-column>

        <el-table-column label="领养费" width="90" align="center">
          <template #default="scope">{{ formatFee(scope.row.adoptionFee) }}</template>
        </el-table-column>

        <el-table-column label="支付" width="80" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.orderPayStatus === 1" type="success" size="small">已支付</el-tag>
            <el-tag v-else-if="scope.row.orderPayStatus === 0" type="warning" size="small">未支付</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ statusMap[scope.row.status] }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="申请时间" width="170" />

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button type="success" link size="small" @click="handleView(scope.row)">
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button v-if="scope.row.status === 1" type="primary" link size="small" @click="handleApprove(scope.row)">
              <el-icon><Check /></el-icon> 通过
            </el-button>
            <el-button v-if="scope.row.status === 1" type="warning" link size="small" @click="handleReject(scope.row)">
              <el-icon><Close /></el-icon> 拒绝
            </el-button>
            <el-button v-if="scope.row.status === 2" type="success" link size="small" @click="handleComplete(scope.row)">
              <el-icon><Check /></el-icon> 完成
            </el-button>
            <el-button v-if="scope.row.status === 2" type="danger" link size="small" @click="handleCancelWaiting(scope.row)">
              <el-icon><Close /></el-icon> 撤销
            </el-button>
            <el-button v-if="scope.row.status === 3 || scope.row.status === 5" type="danger" link size="small" @click="handleDelete(scope.row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog title="领养申请详情" v-model="viewDialogVisible" width="680px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请ID">{{ viewAdoption.id }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="getStatusTagType(viewAdoption.status)" size="large">
            {{ statusMap[viewAdoption.status] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">{{ viewAdoption.createTime }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">用户信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ viewAdoption.username }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ viewAdoption.phone || viewAdoption.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ viewAdoption.email || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">宠物信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="宠物名称">{{ viewAdoption.petName }}</el-descriptions-item>
        <el-descriptions-item label="宠物类型">{{ petTypeMap[viewAdoption.petType] || '-' }}</el-descriptions-item>
        <el-descriptions-item label="宠物品种">{{ viewAdoption.petBreed || '-' }}</el-descriptions-item>
        <el-descriptions-item label="领养费用">
          {{ viewAdoption.adoptionFee != null ? formatFee(viewAdoption.adoptionFee) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="宠物状态" :span="2">
          <el-tag v-if="viewAdoption.petStatus != null" :type="getPetStatusTagType(viewAdoption.petStatus)">
            {{ petStatusLabel(viewAdoption.petStatus) }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">领养信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="领取方式">
          <el-tag :type="viewAdoption.deliveryType === 1 ? 'info' : 'primary'" effect="plain">
            {{ deliveryTypeMap[viewAdoption.deliveryType] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ viewAdoption.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="送达地址" :span="2">{{ viewAdoption.address || '无（上门自取）' }}</el-descriptions-item>
        <el-descriptions-item label="申请理由" :span="2">{{ viewAdoption.applyReason || '无' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">订单信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ viewAdoption.orderNo || '未生成' }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">
          {{ viewAdoption.orderTotalPrice != null ? formatFee(viewAdoption.orderTotalPrice) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag v-if="viewAdoption.orderPayStatus === 1" type="success">已支付</el-tag>
          <el-tag v-else-if="viewAdoption.orderPayStatus === 0" type="warning">未支付</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleApprove(viewAdoption)" :disabled="viewAdoption.status !== 1">
            通过申请
          </el-button>
          <el-button type="warning" @click="handleReject(viewAdoption)" :disabled="viewAdoption.status !== 1">
            拒绝申请
          </el-button>
          <el-button type="success" @click="handleComplete(viewAdoption)" :disabled="viewAdoption.status !== 2">
            标记完成
          </el-button>
          <el-button type="danger" @click="handleCancelWaiting(viewAdoption)" :disabled="viewAdoption.status !== 2">
            撤销(释放宠物)
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Search, Refresh, View, Delete, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adoptionApi } from '@/api'
import { useRoute } from 'vue-router'
import { toStringOrEmpty, toNumberOrUndefined } from '@/utils/query'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const route = useRoute()

const searchForm = reactive({
  userId: '',
  petId: '',
  status: undefined,
  keyword: '',
  timeRange: []
})

// ---- 常量映射 ----
const statusMap = { 1: '待审核', 2: '待支付', 3: '已拒绝', 4: '已完成', 5: '已取消' }
const deliveryTypeMap = { 1: '上门自取', 2: '送宠上门' }
const petTypeMap = { 1: '猫', 2: '狗' }
const petStatusMap = { 1: '用户拥有', 2: '可领养', 3: '已锁定', 4: '待审核', 5: '已删除', 6: '送养完成' }

const getStatusTagType = (status) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'primary'
    case 3: return 'danger'
    case 4: return 'info'
    case 5: return 'info'
    default: return ''
  }
}

const petStatusLabel = (s) => petStatusMap[s] || '-'
const getPetStatusTagType = (s) => {
  if (s === 2) return 'success'
  if (s === 3 || s === 4) return 'warning'
  if (s === 5 || s === 6) return 'info'
  return ''
}

const formatFee = (val) => {
  const fee = Number(val || 0)
  return fee <= 0 ? '免费' : `￥${fee.toFixed(2)}`
}

// ---- 查看详情 ----
const viewDialogVisible = ref(false)
const viewAdoption = ref({})

const handleView = async (row) => {
  try {
    const res = await adoptionApi.getAdoptionDetail(row.id)
    if (res.code === 200) {
      viewAdoption.value = res.data
      viewDialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取详情失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取详情失败')
  }
}

// ---- 搜索 ----
const handleSearch = () => { currentPage.value = 1; loadData() }

const resetSearch = () => {
  searchForm.userId = ''
  searchForm.petId = ''
  searchForm.status = undefined
  searchForm.keyword = ''
  searchForm.timeRange = []
  currentPage.value = 1
  loadData()
}

// ---- 操作 ----
const handleApprove = (row) => {
  ElMessageBox.confirm('确认通过该领养申请吗？通过后宠物将标记为"已锁定/待支付"，支付完成后才会变为送养完成。', '审核确认', {
    confirmButtonText: '确认通过',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    try {
      const res = await adoptionApi.auditAdoption(row.id, 2)
      if (res.code === 200) {
        ElMessage.success('已通过领养申请，进入待支付')
        viewDialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const handleReject = (row) => {
  ElMessageBox.confirm('确认拒绝该领养申请吗?', '审核确认', {
    confirmButtonText: '确认拒绝',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await adoptionApi.auditAdoption(row.id, 3)
      if (res.code === 200) {
        ElMessage.success('已拒绝领养申请')
        viewDialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const handleComplete = (row) => {
  ElMessageBox.confirm('确认将该领养申请标记为已完成吗？表示宠物已送达用户手中。', '确认', {
    confirmButtonText: '确认完成',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const res = await adoptionApi.auditAdoption(row.id, 4)
      if (res.code === 200) {
        ElMessage.success('已标记为完成')
        viewDialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const handleCancelWaiting = (row) => {
  ElMessageBox.confirm('确认撤销该待支付申请并释放宠物吗？撤销后宠物会重新变为可领养。', '撤销确认', {
    confirmButtonText: '确认撤销',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await adoptionApi.cancelAdoption(row.id)
      if (res.code === 200) {
        ElMessage.success('已撤销并释放宠物')
        viewDialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  const name = row.username || ''
  const pet = row.petName || ''
  ElMessageBox.confirm(`确认删除"${name}"对"${pet}"的领养申请吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await adoptionApi.deleteAdoption(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// ---- 分页 ----
const handleSizeChange = (val) => { pageSize.value = val; loadData() }
const handleCurrentChange = (val) => { currentPage.value = val; loadData() }

// ---- 数据加载 ----

const tableData = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const [startTime, endTime] = searchForm.timeRange || []
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      userId: searchForm.userId || undefined,
      petId: searchForm.petId || undefined,
      status: searchForm.status,
      keyword: searchForm.keyword || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined
    }
    const res = await adoptionApi.getAdoptionPage(params)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = parseInt(res.data.total)
    } else {
      ElMessage.error(res.msg || '获取数据失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => route.query,
  () => {
    searchForm.keyword = toStringOrEmpty(route.query.keyword)
    searchForm.status = toNumberOrUndefined(route.query.status)
    searchForm.timeRange = []
    currentPage.value = 1
    loadData()
  },
  { immediate: true }
)
</script>

<style scoped>
.adoption-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.table-card {
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 8px;
}

.search-form .el-form-item {
  margin-bottom: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-divider {
  margin: 16px 0;
}
</style>
