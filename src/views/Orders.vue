<template>
  <div class="orders-container">
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="searchForm.payStatus" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="未支付" :value="0" />
            <el-option label="已支付" :value="1" />
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

        <el-table-column prop="orderNo" label="订单编号" min-width="180">
          <template #default="scope">
            <span class="order-no">{{ scope.row.orderNo }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="username" label="用户" width="120" />

        <el-table-column prop="totalPrice" label="订单金额" width="120" align="center">
          <template #default="scope">
            <span class="price">¥{{ scope.row.totalPrice }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="payStatus" label="支付状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.payStatus === 1 ? 'success' : 'warning'">
              {{ payStatusMap[scope.row.payStatus] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="payMethod" label="支付方式" width="100" align="center">
          <template #default="scope">
            <template v-if="scope.row.payMethod">
              <el-tag :type="scope.row.payMethod === 1 ? 'success' : 'primary'" effect="plain">
                {{ payMethodMap[scope.row.payMethod] }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="payTime" label="支付时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.payTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180" />

        <el-table-column prop="updateTime" label="更新时间" width="180" />

        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="scope">
            <el-button type="success" link size="small" @click="handleView(scope.row)">
              <el-icon>
                <View />
              </el-icon> 详情
            </el-button>
            <el-button type="primary" link size="small" @click="handleMarkPaid(scope.row)"
              :disabled="scope.row.payStatus === 1">
              <el-icon>
                <Wallet />
              </el-icon> 标记支付
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
    <el-dialog title="订单详情" v-model="viewDialogVisible" width="650px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号" :span="2">
          <span class="order-no">{{ viewOrder.orderNo }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="price large">¥{{ viewOrder.totalPrice }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="viewOrder.payStatus === 1 ? 'success' : 'warning'" size="large">
            {{ payStatusMap[viewOrder.payStatus] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          {{ viewOrder.payMethod ? payMethodMap[viewOrder.payMethod] : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ formatDateTime(viewOrder.payTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">用户信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ viewOrder.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ viewOrder.phone || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">预约信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="预约ID">{{ viewOrder.appointmentId }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ formatDateTime(viewOrder.appointmentTime) }}</el-descriptions-item>
        <el-descriptions-item label="宠物名称">{{ viewOrder.petName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务项目">{{ viewOrder.serviceName || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">其他信息</el-divider>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单备注">{{ viewOrder.remark || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewOrder.createTime }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleMarkPaid(viewOrder)" :disabled="viewOrder.payStatus === 1">
            标记已支付
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 标记支付弹窗 -->
    <el-dialog title="标记已支付" v-model="payDialogVisible" width="400px" destroy-on-close>
      <el-form :model="payForm" label-width="100px">
        <el-form-item label="支付方式" required>
          <el-radio-group v-model="payForm.payMethod">
            <el-radio :value="1">
              <el-icon style="color: #07c160;">
                <ChatDotRound />
              </el-icon> 微信支付
            </el-radio>
            <el-radio :value="2">
              <el-icon style="color: #1677ff;">
                <Wallet />
              </el-icon> 支付宝
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="payDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmMarkPaid">确认支付</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, View, Delete, Wallet, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ordersApi } from '@/api'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  orderNo: '',
  payStatus: undefined
})

// 状态映射
const payStatusMap = {
  0: '未支付',
  1: '已支付'
}

const payMethodMap = {
  1: '微信支付',
  2: '支付宝'
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
const viewOrder = ref({})

const handleView = async (row) => {
  try {
    const res = await ordersApi.getOrderDetail(row.id)
    if (res.code === 200) {
      viewOrder.value = res.data
      viewDialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取详情失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取详情失败')
  }
}

// 标记支付相关
const payDialogVisible = ref(false)
const payForm = reactive({
  orderId: null,
  payMethod: 1
})

const handleMarkPaid = (row) => {
  payForm.orderId = row.id
  payForm.payMethod = 1
  payDialogVisible.value = true
}

const confirmMarkPaid = async () => {
  try {
    const res = await ordersApi.updatePayStatus(payForm.orderId, 1, payForm.payMethod)
    if (res.code === 200) {
      ElMessage.success('标记支付成功')
      payDialogVisible.value = false
      viewDialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

// 列表数据
const tableData = ref([])

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.payStatus = undefined
  currentPage.value = 1
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该订单吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await ordersApi.deleteOrder(row.id)
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
      orderNo: searchForm.orderNo || undefined,
      payStatus: searchForm.payStatus
    }
    const res = await ordersApi.getOrderPage(params)
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
.orders-container {
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

.order-no {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  color: #409eff;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.price.large {
  font-size: 18px;
}

.el-divider {
  margin: 16px 0;
}
</style>
