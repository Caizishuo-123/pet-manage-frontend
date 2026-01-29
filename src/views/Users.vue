<template>
  <div class="users-container">
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
        </div>
      </template>

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

        <el-table-column label="头像" width="100" align="center">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar">{{ scope.row.username.charAt(0) }}</el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />

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

        <el-table-column prop="createTime" label="创建时间" width="180" />

        <el-table-column prop="updateTime" label="更新时间" width="180" />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)" :disabled="!canEdit(scope.row)">
              <el-icon>
                <Edit />
              </el-icon> 编辑
            </el-button>
            <el-button :type="scope.row.status === 1 ? 'danger' : 'success'" link size="small"
              @click="handleDelete(scope.row)" :disabled="!canToggleStatus(scope.row)">
              <el-icon>
                <component :is="scope.row.status === 1 ? 'Delete' : 'Check'" />
              </el-icon> {{ scope.row.status === 1 ? '禁用' : '启用' }}
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="400px" @close="resetForm">
      <el-form ref="userFormRef" :model="userForm" label-width="80px">
        <el-form-item label="当前用户">
          <span>{{ userForm.username }}</span>
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="普通用户" :value="1" />
            <el-option label="管理员" :value="2" />
            <el-option label="超级管理员" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="默认地址">
          <el-input v-model="userForm.address" placeholder="请输入默认收货地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, Plus, Edit, Delete, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const currentPage = ref(1)

// 获取当前登录用户的角色
const currentUserRole = computed(() => userStore.userInfo?.role || 1)

/**
 * 判断是否可以编辑用户
 * 规则：
 * 1. 不能编辑自己
 * 2. 管理员不能编辑超级管理员
 */
const canEdit = (row) => {
  // 不能编辑自己
  if (userStore.userInfo?.username === row.username) return false
  // 管理员(role=2)不能编辑超级管理员(role=3)
  if (currentUserRole.value === 2 && row.role === 3) return false
  return true
}

/**
 * 判断是否可以禁用/启用用户
 * 规则：
 * 1. 不能操作自己
 * 2. 管理员不能操作超级管理员
 * 3. 只有普通用户才能被禁用
 */
const canToggleStatus = (row) => {
  // 不能操作自己
  if (userStore.userInfo?.username === row.username) return false
  // 管理员不能操作超级管理员
  if (currentUserRole.value === 2 && row.role === 3) return false
  // 只有普通用户(role=1)才能被禁用/启用
  if (row.role !== 1) return false
  return true
}
const pageSize = ref(10)
const total = ref(100)

const searchForm = reactive({
  id: '',
  username: '',
  phone: '',
  status: undefined,
  role: undefined
})

// 弹窗相关
const dialogVisible = ref(false)
const userForm = reactive({
  id: undefined,
  username: '',
  role: undefined,
  address: ''
})

const dialogTitle = '修改角色'

const userRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 列表数据
const tableData = ref([])

const roleNameMap = {
  1: '普通用户',
  2: '管理员',
  3: '超级管理员'
}

const roleTypeMap = {
  1: 'info',
  2: '',
  3: 'danger'
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.id = ''
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.status = undefined
  searchForm.role = undefined
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  userForm.id = row.id
  userForm.username = row.username
  userForm.role = row.role
  userForm.address = row.address || ''
  dialogVisible.value = true
}

const handleDelete = (row) => {
  const actionText = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${actionText}该用户吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: row.status === 1 ? 'warning' : 'success'
  }).then(async () => {
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
    }
  })
}

const handleSubmit = async () => {
  if (!userForm.id) return
  if (userForm.role === undefined) {
    ElMessage.warning('请选择角色')
    return
  }

  try {
    const res = await userApi.updateUserInfo({
      id: userForm.id,
      role: userForm.role,
      address: userForm.address || null
    })
    if (res.code === 200) {
      ElMessage.success('更新成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('系统异常')
  }
}

const resetForm = () => {
  userForm.id = undefined
  userForm.role = undefined
  userForm.address = ''
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

const handleStatusChange = async (row) => {
  row.statusLoading = true
  try {
    const res = await userApi.toggleUserStatus(row.id)
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
    } else {
      ElMessage.error(res.msg || '状态更新失败')
      // 失败时回滚状态
      row.status = row.status === 1 ? 0 : 1
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('系统异常')
    row.status = row.status === 1 ? 0 : 1
  } finally {
    row.statusLoading = false
  }
}

// ============ 数据加载 ============
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      id: searchForm.id || undefined,
      username: searchForm.username || undefined,
      phone: searchForm.phone || undefined,
      role: searchForm.role !== undefined ? searchForm.role : undefined,
      status: searchForm.status !== undefined ? searchForm.status : undefined
    }
    const res = await userApi.getUserPage(params)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = parseInt(res.data.total)
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

.search-card {
  border: none;
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
</style>
