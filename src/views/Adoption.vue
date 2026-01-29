<template>
  <div class="adoption-container">
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>领养申请列表</span>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="Number(value)" />
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

        <el-table-column prop="username" label="申请用户" width="120" />

        <el-table-column prop="petName" label="申请宠物" min-width="120" />

        <el-table-column prop="applyReason" label="申请理由" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.applyReason || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="deliveryType" label="领取方式" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.deliveryType === 1 ? 'info' : 'primary'" effect="plain">
              {{ deliveryTypeMap[scope.row.deliveryType] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="address" label="送达地址" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.address || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="contactPhone" label="联系电话" width="130">
          <template #default="scope">
            {{ scope.row.contactPhone || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ statusMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="申请时间" width="180" />

        <el-table-column prop="updateTime" label="更新时间" width="180" />

        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button type="success" link size="small" @click="handleView(scope.row)">
              <el-icon>
                <View />
              </el-icon> 详情
            </el-button>
            <el-button type="primary" link size="small" @click="handleApprove(scope.row)"
              :disabled="scope.row.status !== 1">
              <el-icon>
                <Check />
              </el-icon> 通过
            </el-button>
            <el-button type="warning" link size="small" @click="handleReject(scope.row)"
              :disabled="scope.row.status !== 1">
              <el-icon>
                <Close />
              </el-icon> 拒绝
            </el-button>
            <el-button type="info" link size="small" @click="handleComplete(scope.row)"
              :disabled="scope.row.status !== 2">
              <el-icon>
                <Finished />
              </el-icon> 完成
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
        <el-descriptions-item label="联系电话">{{ viewAdoption.phone || viewAdoption.contactPhone || '-'
        }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">宠物信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="宠物名称">{{ viewAdoption.petName }}</el-descriptions-item>
        <el-descriptions-item label="宠物类型">{{ petTypeMap[viewAdoption.petType] || '-' }}</el-descriptions-item>
        <el-descriptions-item label="宠物品种">{{ viewAdoption.petBreed || '-' }}</el-descriptions-item>
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

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleApprove(viewAdoption)" :disabled="viewAdoption.status !== 1">
            通过申请
          </el-button>
          <el-button type="warning" @click="handleReject(viewAdoption)" :disabled="viewAdoption.status !== 1">
            拒绝申请
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, View, Delete, Check, Close, Finished } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adoptionApi } from '@/api'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  status: undefined
})

// 状态映射
const statusMap = {
  1: '待审核',
  2: '已通过',
  3: '已拒绝',
  4: '已完成'
}

// 领取方式映射
const deliveryTypeMap = {
  1: '上门自取',
  2: '送宠上门'
}

// 宠物类型映射
const petTypeMap = {
  1: '猫',
  2: '狗'
}

const getStatusTagType = (status) => {
  switch (status) {
    case 1: return 'warning'  // 待审核 - 黄色
    case 2: return 'success'  // 已通过 - 绿色
    case 3: return 'danger'   // 已拒绝 - 红色
    case 4: return 'info'     // 已完成 - 灰色
    default: return ''
  }
}

// 查看详情相关
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

// 列表数据
const tableData = ref([])

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.status = undefined
  currentPage.value = 1
  loadData()
}

const handleApprove = (row) => {
  ElMessageBox.confirm('确认通过该领养申请吗？通过后宠物将标记为"已领养"。', '审核确认', {
    confirmButtonText: '确认通过',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    try {
      const res = await adoptionApi.auditAdoption(row.id, 2)
      if (res.code === 200) {
        ElMessage.success('已通过领养申请')
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
  })
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
  ElMessageBox.confirm('确认删除该领养申请记录吗?', '提示', {
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
      status: searchForm.status
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

onMounted(() => {
  loadData()
})
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-divider {
  margin: 16px 0;
}
</style>
