<template>
  <div class="appointment-container">
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>预约列表</span>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 150px" disabled />
        </el-form-item>
        <el-form-item label="服务">
          <el-select v-model="searchForm.serviceId" placeholder="请选择服务" clearable style="width: 150px">
            <el-option v-for="item in serviceList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option v-for="(label, value) in appointmentStatusMap" :key="value" :label="label"
              :value="Number(value)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon> 查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon>
              <Refresh />
            </el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column prop="username" label="用户" min-width="100" />

        <el-table-column prop="petName" label="宠物" min-width="100" />

        <el-table-column prop="serviceName" label="服务项目" min-width="120">
          <template #default="scope">
            <div>
              <span>{{ scope.row.serviceName }}</span>
              <div class="price-tag" v-if="scope.row.servicePrice">¥{{ scope.row.servicePrice }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="appointmentTime" label="预约时间" width="180">
          <template #default="scope">
            <el-icon style="margin-right: 4px;">
              <Clock />
            </el-icon>
            {{ formatDateTime(scope.row.appointmentTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ appointmentStatusMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.remark || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180" />

        <el-table-column prop="updateTime" label="更新时间" width="180" />

        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button type="success" link size="small" @click="handleView(scope.row)">
              <el-icon>
                <View />
              </el-icon> 详情
            </el-button>
            <el-button type="primary" link size="small" @click="handleComplete(scope.row)"
              :disabled="scope.row.status !== 1">
              <el-icon>
                <Check />
              </el-icon> 完成
            </el-button>
            <el-button type="warning" link size="small" @click="handleCancel(scope.row)"
              :disabled="scope.row.status !== 1">
              <el-icon>
                <Close />
              </el-icon> 取消
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">
              <el-icon>
                <Delete />
              </el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog title="预约详情" v-model="viewDialogVisible" width="650px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="预约ID">{{ viewAppointment.id }}</el-descriptions-item>
        <el-descriptions-item label="预约状态">
          <el-tag :type="getStatusTagType(viewAppointment.status)">
            {{ appointmentStatusMap[viewAppointment.status] }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="预约时间" :span="2">
          <el-icon style="margin-right: 4px;">
            <Clock />
          </el-icon>
          {{ formatDateTime(viewAppointment.appointmentTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">用户信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ viewAppointment.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ viewAppointment.phone || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">宠物信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="宠物名称">{{ viewAppointment.petName }}</el-descriptions-item>
        <el-descriptions-item label="宠物类型">{{ petTypeMap[viewAppointment.petType] || '-' }}</el-descriptions-item>
        <el-descriptions-item label="宠物品种">{{ viewAppointment.petBreed || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">服务信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="服务名称">{{ viewAppointment.serviceName }}</el-descriptions-item>
        <el-descriptions-item label="服务类型">{{ serviceTypeMap[viewAppointment.serviceType] || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="服务价格">
          <span class="price">¥{{ viewAppointment.servicePrice }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">备注信息</el-divider>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户备注">{{ viewAppointment.remark || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewAppointment.createTime }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleComplete(viewAppointment)" :disabled="viewAppointment.status !== 1">
            标记完成
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, View, Delete, Check, Close, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { appointmentApi, petServiceApi } from '@/api'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  username: '',
  serviceId: undefined,
  status: undefined
})

// 服务列表（下拉选择用）
const serviceList = ref([])

// 状态映射
const appointmentStatusMap = {
  1: '已预约',
  2: '已完成',
  3: '已取消'
}

// 宠物类型映射
const petTypeMap = {
  1: '猫',
  2: '狗'
}

// 服务类型映射
const serviceTypeMap = {
  1: '美容',
  2: '洗护',
  3: '医疗',
  4: '寄养',
  5: '训练',
  6: '接送'
}

const getStatusTagType = (status) => {
  switch (status) {
    case 1: return 'warning'  // 已预约 - 黄色
    case 2: return 'success'  // 已完成 - 绿色
    case 3: return 'info'     // 已取消 - 灰色
    default: return ''
  }
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 查看详情相关
const viewDialogVisible = ref(false)
const viewAppointment = ref({})

const handleView = async (row) => {
  try {
    const res = await appointmentApi.getAppointmentDetail(row.id)
    if (res.code === 200) {
      viewAppointment.value = res.data
      viewDialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取详情失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取详情失败')
  }
}

// 列表数据
const tableData = ref([])

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.username = ''
  searchForm.serviceId = undefined
  searchForm.status = undefined
  currentPage.value = 1
  loadData()
}

const handleComplete = (row) => {
  ElMessageBox.confirm('确认将该预约标记为已完成吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const res = await appointmentApi.updateAppointmentStatus(row.id, 2)
      if (res.code === 200) {
        ElMessage.success('操作成功')
        viewDialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  })
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确认取消该预约吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await appointmentApi.updateAppointmentStatus(row.id, 3)
      if (res.code === 200) {
        ElMessage.success('已取消预约')
        loadData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该预约记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await appointmentApi.deleteAppointment(row.id)
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
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      serviceId: searchForm.serviceId,
      status: searchForm.status
    }
    const res = await appointmentApi.getAppointmentPage(params)
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

const loadServiceList = async () => {
  try {
    const res = await petServiceApi.getEnabledServices()
    if (res.code === 200) {
      serviceList.value = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadData()
  loadServiceList()
})
</script>

<style scoped>
.appointment-container {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.price-tag {
  color: #f56c6c;
  font-size: 12px;
}

.el-divider {
  margin: 16px 0;
}
</style>
