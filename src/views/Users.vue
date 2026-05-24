<template>
  <div class="users-container">
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增用户
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="ID">
          <el-input v-model="searchForm.id" placeholder="请输入用户ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="用户名/手机号/邮箱" clearable style="width: 180px" />
        </el-form-item>

        <template v-if="showAdvanced">
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="searchForm.role" placeholder="请选择角色" clearable style="width: 120px">
              <el-option v-for="(name, value) in roleNameMap" :key="value" :label="name" :value="Number(value)" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
              style="width: 320px"
            />
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
          <el-button link type="primary" @click="showAdvanced = !showAdvanced">
            {{ showAdvanced ? '收起筛选' : '更多筛选' }}
            <el-icon><component :is="showAdvanced ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        border
        highlight-current-row
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column label="头像" width="80" align="center">
          <template #default="scope">
            <el-popover placement="right" :width="160" trigger="hover">
              <template #reference>
                <el-avatar :size="40" :src="scope.row.avatar" style="cursor: pointer">
                  {{ scope.row.username?.charAt(0) }}
                </el-avatar>
              </template>
              <el-avatar :size="120" :src="scope.row.avatar">
                {{ scope.row.username?.charAt(0) }}
              </el-avatar>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />

        <el-table-column prop="address" label="地址" min-width="140">
          <template #default="scope">
            {{ scope.row.address || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="email" label="邮箱" min-width="150">
          <template #default="scope">
            {{ scope.row.email || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="role" label="角色" width="120" align="center">
          <template #default="scope">
            <el-tag :type="roleTypeMap[scope.row.role]">{{ roleNameMap[scope.row.role] }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="170" />

        <el-table-column prop="updateTime" label="更新时间" width="170" />

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleDetail(scope.row)">
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button
              type="primary" link size="small"
              @click="handleEdit(scope.row)"
              :disabled="!canEdit(scope.row)"
            >
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button
              :type="scope.row.status === 1 ? 'danger' : 'success'"
              link size="small"
              @click="handleToggleStatus(scope.row)"
              :disabled="!canToggleStatus(scope.row)"
              :loading="scope.row._toggling"
            >
              <el-icon><component :is="scope.row.status === 1 ? 'Close' : 'Check'" /></el-icon>
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="440px" @close="resetForm">
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="80px">
        <el-form-item v-if="isEditMode" label="当前用户">
          <span>{{ userForm.username }}</span>
        </el-form-item>
        <el-form-item v-else label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item v-if="!isEditMode" label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="普通用户" :value="1" />
            <el-option label="管理员" :value="2" />
            <el-option label="超级管理员" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="地址">
          <el-input v-model="userForm.address" placeholder="请输入地址" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog title="用户详情" v-model="detailVisible" width="480px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailData.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailData.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detailData.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="roleTypeMap[detailData.role]">{{ roleNameMap[detailData.role] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 1 ? 'success' : 'warning'">
            {{ detailData.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ detailData.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Search, Refresh, Plus, Edit, View, Close, Check, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi, userApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAdvanced = ref(false)

const currentUserRole = computed(() => userStore.userInfo?.role || 1)

const canEdit = (row) => {
  if (userStore.userInfo?.username === row.username) return false
  if (currentUserRole.value === 2 && row.role === 3) return false
  return true
}

const canToggleStatus = (row) => {
  if (userStore.userInfo?.username === row.username) return false
  if (currentUserRole.value === 2 && row.role === 3) return false
  if (row.role !== 1) return false
  return true
}

const searchForm = reactive({
  id: '',
  username: '',
  phone: '',
  email: '',
  keyword: '',
  status: undefined,
  role: undefined,
  timeRange: []
})

// ---- 新增/编辑弹窗 ----
const dialogVisible = ref(false)
const submitting = ref(false)
const userFormRef = ref(null)

const userForm = reactive({
  id: undefined,
  username: '',
  phone: '',
  role: undefined,
  address: '',
  email: ''
})

const isEditMode = computed(() => !!userForm.id)

const dialogTitle = computed(() => isEditMode.value ? '编辑用户' : '新增用户')

const userRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
}

// ---- 详情弹窗 ----
const detailVisible = ref(false)
const detailData = reactive({})

// ---- 常量 ----
const roleNameMap = { 1: '普通用户', 2: '管理员', 3: '超级管理员' }
const roleTypeMap = { 1: 'info', 2: '', 3: 'danger' }

// ---- 搜索 ----
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.id = ''
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.email = ''
  searchForm.keyword = ''
  searchForm.status = undefined
  searchForm.role = undefined
  searchForm.timeRange = []
  currentPage.value = 1
  loadData()
}

// ---- CRUD ----
const handleAdd = () => {
  userForm.id = undefined
  userForm.username = ''
  userForm.phone = ''
  userForm.role = undefined
  userForm.address = ''
  userForm.email = ''
  userFormRef.value?.clearValidate()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  userForm.id = row.id
  userForm.username = row.username
  userForm.phone = row.phone || ''
  userForm.role = row.role
  userForm.address = row.address || ''
  userForm.email = row.email || ''
  userFormRef.value?.clearValidate()
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  try {
    await userFormRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    if (isEditMode.value) {
      const res = await userApi.updateUserInfo({
        id: userForm.id,
        role: userForm.role,
        address: userForm.address || null,
        email: userForm.email || null
      })
      if (res.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } else {
      const res = await authApi.register({
        username: userForm.username,
        password: '123456',
        phone: userForm.phone,
        role: userForm.role,
        address: userForm.address || '',
        email: userForm.email || ''
      })
      if (res.code === 200) {
        ElMessage.success('用户创建成功，默认密码为 123456')
        dialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('系统异常')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  userForm.id = undefined
  userForm.username = ''
  userForm.phone = ''
  userForm.role = undefined
  userForm.address = ''
  userForm.email = ''
  userFormRef.value?.clearValidate()
}

const handleToggleStatus = (row) => {
  const actionText = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${actionText}该用户吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: row.status === 1 ? 'warning' : 'success'
  }).then(async () => {
    row._toggling = true
    try {
      const res = await userApi.toggleUserStatus(row.id)
      if (res.code === 200) {
        ElMessage.success(`用户已${actionText}`)
        loadData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('系统异常')
    } finally {
      row._toggling = false
    }
  }).catch(() => {})
}

const handleDetail = (row) => {
  Object.assign(detailData, row)
  detailVisible.value = true
}

// ---- 分页 ----
const handleSizeChange = (val) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

// ---- 数据加载 ----
const loadData = async () => {
  loading.value = true
  try {
    const [startTime, endTime] = searchForm.timeRange || []
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      id: searchForm.id || undefined,
      username: searchForm.username || undefined,
      phone: searchForm.phone || undefined,
      email: searchForm.email || undefined,
      keyword: searchForm.keyword || undefined,
      role: searchForm.role !== undefined ? searchForm.role : undefined,
      status: searchForm.status !== undefined ? searchForm.status : undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined
    }
    const res = await userApi.getUserPage(params)
    if (res.code === 200) {
      tableData.value = (res.data.records || []).map(row => ({ ...row, _toggling: false }))
      total.value = parseInt(res.data.total) || 0
    } else {
      ElMessage.error(res.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('Data Load Error:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const tableData = ref([])

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.users-container {
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
</style>
