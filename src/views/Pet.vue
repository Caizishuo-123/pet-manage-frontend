<template>
  <div class="pets-container">
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>宠物列表</span>
          <div>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedIds.length === 0">
              <el-icon><Delete /></el-icon> 批量删除
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon> 新增宠物
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="请输入宠物名称" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 100px">
            <el-option label="猫" :value="1" />
            <el-option label="狗" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="品种">
          <el-input v-model="searchForm.breed" placeholder="请输入品种" clearable style="width: 130px" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="名称/品种/描述" clearable style="width: 160px" />
        </el-form-item>

        <template v-if="showAdvanced">
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 110px">
              <el-option v-for="(label, value) in petStatusMap" :key="value" :label="label" :value="Number(value)" />
            </el-select>
          </el-form-item>
          <el-form-item label="来源">
            <el-select v-model="searchForm.source" placeholder="请选择来源" clearable style="width: 110px">
              <el-option v-for="(label, value) in petSourceMap" :key="value" :label="label" :value="Number(value)" />
            </el-select>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="searchForm.gender" placeholder="请选择性别" clearable style="width: 100px">
              <el-option label="公" :value="1" />
              <el-option label="母" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
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
        :data="tableData" style="width: 100%" v-loading="loading" border
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="ID" width="70" align="center" />

        <el-table-column label="图片" width="70" align="center">
          <template #default="scope">
            <el-avatar v-if="scope.row.image" :size="40" :src="getCosUrl(scope.row.image)" shape="square" />
            <el-avatar v-else :size="40" shape="square">
              <el-icon><Picture /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="名称" min-width="110" />

        <el-table-column prop="type" label="类型" width="70" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.type === 1 ? 'warning' : 'success'">{{ petTypeMap[scope.row.type] }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="breed" label="品种" width="100" />

        <el-table-column label="年龄" width="90" align="center">
          <template #default="scope">
            {{ formatAge(scope.row.age) }}
          </template>
        </el-table-column>

        <el-table-column prop="gender" label="性别" width="70" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.gender === 1 ? '' : 'danger'" effect="plain">
              {{ petGenderMap[scope.row.gender] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="健康状态" min-width="130">
          <template #default="scope">
            <template v-if="scope.row.healthStatus">
              <el-tag v-for="item in getHealthTags(scope.row.healthStatus)" :key="item.value"
                size="small" style="margin:1px" :type="getHealthTagType(item.value)">
                {{ item.label }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="getPetStatusType(scope.row.status)">
              {{ petStatusMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="领养费" width="100" align="center">
          <template #default="scope">
            <span>{{ formatAdoptionFee(scope.row.adoptionFee) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="source" label="来源" width="90" align="center">
          <template #default="scope">
            {{ petSourceMap[scope.row.source] }}
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="170" />

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === 4" type="warning" link size="small" @click="openAuditDialog(scope.row)">
              <el-icon><View /></el-icon> 审核
            </el-button>
            <el-button type="success" link size="small" @click="handleView(scope.row)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="resetForm">
      <el-form ref="petFormRef" :model="petForm" :rules="petRules" label-width="100px">

        <el-form-item label="宠物图片" prop="image">
          <el-upload ref="uploadRef" class="avatar-uploader" action="/cos/upload?type=pet"
            :show-file-list="false" :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload" @drop.prevent="handleDrop" @dragover.prevent>
            <el-image v-if="petForm.image" :src="getCosUrl(petForm.image)" class="avatar"
              :preview-src-list="[getCosUrl(petForm.image)]" fit="cover" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="petForm.name" placeholder="请输入宠物名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品种" prop="breed">
              <el-input v-model="petForm.breed" placeholder="请输入品种" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-radio-group v-model="petForm.type">
                <el-radio :label="1">猫</el-radio>
                <el-radio :label="2">狗</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="petForm.gender">
                <el-radio :label="1">公</el-radio>
                <el-radio :label="2">母</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄(月)" prop="age">
              <el-input-number v-model="petForm.age" :min="0" :max="300" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源" prop="source">
              <el-select v-model="petForm.source" placeholder="请选择来源" style="width: 100%">
                <el-option v-for="(label, value) in petSourceMap" :key="value" :label="label" :value="Number(value)" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态" prop="status">
          <el-select v-model="petForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option v-for="(label, value) in petStatusMap" :key="value" :label="label" :value="Number(value)" />
          </el-select>
        </el-form-item>

        <el-form-item label="领养费用" prop="adoptionFee">
          <el-input-number v-model="petForm.adoptionFee" :min="0" :precision="2" :step="10" style="width: 100%" />
        </el-form-item>

        <el-form-item label="健康状态" prop="healthStatus">
          <el-checkbox-group v-model="selectedHealthStatus">
            <el-checkbox v-for="(label, value) in healthStatusMap" :key="value" :label="Number(value)">
              {{ label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="petForm.description" type="textarea" :rows="3" placeholder="请输入描述信息" />
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog title="宠物详情" v-model="viewDialogVisible" width="650px" destroy-on-close @close="viewPet = {}">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ viewPet.id }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ viewPet.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ petTypeMap[viewPet.type] || '-' }}</el-descriptions-item>
        <el-descriptions-item label="品种">{{ viewPet.breed || '-' }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ formatAge(viewPet.age) }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ petGenderMap[viewPet.gender] || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getPetStatusType(viewPet.status)">{{ petStatusMap[viewPet.status] || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="来源">{{ petSourceMap[viewPet.source] || '-' }}</el-descriptions-item>
        <el-descriptions-item label="领养费用">{{ formatAdoptionFee(viewPet.adoptionFee) }}</el-descriptions-item>
        <el-descriptions-item label="所属用户ID">{{ viewPet.ownerId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="健康状态" :span="2">
          <template v-if="viewPet.healthStatus">
            <el-tag v-for="item in getHealthTags(viewPet.healthStatus)" :key="item.value"
              style="margin-right:5px" :type="getHealthTagType(item.value)">
              {{ item.label }}
            </el-tag>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ viewPet.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewPet.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ viewPet.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="viewPet.image" style="margin-top:16px">
        <el-image :src="getCosUrl(viewPet.image)" style="width:200px;height:200px" fit="cover"
          :preview-src-list="[getCosUrl(viewPet.image)]" />
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="审核送养宠物" width="520px" @close="resetAuditForm">
      <el-form :model="auditForm" label-width="90px">
        <el-form-item label="宠物名称">
          <span>{{ auditTarget?.name || '-' }}</span>
        </el-form-item>
        <el-form-item label="品种">
          <span>{{ auditTarget?.breed || '-' }}</span>
        </el-form-item>
        <el-form-item label="年龄">
          <span>{{ formatAge(auditTarget?.age) }}</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="getPetStatusType(auditTarget?.status)">{{ petStatusMap[auditTarget?.status] || '-' }}</el-tag>
        </el-form-item>
        <el-form-item label="健康状态">
          <template v-if="auditTarget?.healthStatus">
            <el-tag v-for="item in getHealthTags(auditTarget.healthStatus)" :key="item.value"
              size="small" style="margin-right:3px" :type="getHealthTagType(item.value)">
              {{ item.label }}
            </el-tag>
          </template>
          <span v-else>-</span>
        </el-form-item>
        <el-form-item label="描述">
          <span>{{ auditTarget?.description || '-' }}</span>
        </el-form-item>
        <el-form-item label="领养费用">
          <span>{{ formatAdoptionFee(auditTarget?.adoptionFee) }}</span>
        </el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="2">通过上架</el-radio>
            <el-radio :label="1">退回自养</el-radio>
            <el-radio :label="5">直接删除</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="auditSubmitting" @click="handleAuditSubmit">确认审核</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted } from 'vue'
import {
  Search, Refresh, Plus, Edit, Delete, View, Picture, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { petApi } from '@/api'
import { getCosUrl } from '@/utils/request'
import { toStringOrEmpty, toNumberOrUndefined } from '@/utils/query'
import { beforeAvatarUpload } from '@/utils/upload'
import { useRoute } from 'vue-router'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const route = useRoute()
const showAdvanced = ref(false)

// ---- 批量删除 ----
const selectedIds = ref([])
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// ---- 搜索表单 ----
const searchForm = reactive({
  name: '',
  type: undefined,
  breed: '',
  keyword: '',
  status: undefined,
  source: undefined,
  gender: undefined,
  timeRange: []
})

// ---- 常量映射 ----
const petTypeMap = { 1: '猫', 2: '狗' }
const petGenderMap = { 1: '公', 2: '母' }

const petStatusMap = {
  1: '用户拥有',
  2: '可领养',
  3: '已锁定',
  4: '待审核',
  5: '已删除',
  6: '送养完成'
}

const petSourceMap = { 1: '用户拥有', 2: '平台发布' }

const healthStatusMap = {
  1: '疫苗', 2: '驱虫', 4: '绝育', 8: '健康',
  16: '慢性病', 32: '观察中', 64: '特殊照顾'
}

// ---- 工具函数 ----
const formatAge = (months) => {
  if (months == null) return '-'
  if (months < 12) return `${months} 个月`
  const years = Math.floor(months / 12)
  const remain = months % 12
  return remain > 0 ? `${years} 岁 ${remain} 个月` : `${years} 岁`
}

const formatAdoptionFee = (value) => {
  const fee = Number(value || 0)
  return fee <= 0 ? '免费' : `￥${fee.toFixed(2)}`
}

const getHealthTagType = (val) => {
  if (val & 64) return 'danger'
  if (val & (16 | 32)) return 'warning'
  return ''
}

const getPetStatusType = (status) => {
  switch (status) {
    case 1: return 'info'
    case 2: return 'success'
    case 3: return 'warning'
    case 4: return 'warning'
    case 5: return 'info'
    case 6: return 'info'
    default: return ''
  }
}

const getHealthTags = (status) => {
  const tags = []
  if (!status) return tags
  for (const [key, value] of Object.entries(healthStatusMap)) {
    const bit = Number(key)
    if ((status & bit) === bit) {
      tags.push({ value: bit, label: value })
    }
  }
  return tags
}

// ---- 查看详情 ----
const viewDialogVisible = ref(false)
const viewPet = ref({})

const handleView = (row) => {
  viewPet.value = { ...row }
  viewDialogVisible.value = true
}

// ---- 新增/编辑弹窗 ----
const dialogVisible = ref(false)
const dialogTitle = ref('新增宠物')
const petFormRef = ref(null)
const uploadRef = ref(null)

const petForm = reactive({
  id: undefined,
  name: '',
  image: '',
  type: 1,
  breed: '',
  age: 0,
  gender: 1,
  healthStatus: 0,
  description: '',
  adoptionFee: 0,
  source: 2,
  status: 2,
  ownerId: null
})

const selectedHealthStatus = ref([])

const petRules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  adoptionFee: [{ required: true, message: '请输入领养费用', trigger: 'change' }]
}

// ---- 审核弹窗 ----
const auditDialogVisible = ref(false)
const auditSubmitting = ref(false)
const auditTarget = ref(null)
const auditForm = reactive({ status: 2 })

// ---- 粘贴/拖拽上传 (统一走 el-upload) ----
const handlePaste = (e) => {
  if (!dialogVisible.value) return
  const items = e.clipboardData?.items
  if (!items) return
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const file = items[i].getAsFile()
      uploadRef.value?.handleStart(file)
      uploadRef.value?.submit()
      break
    }
  }
}

const handleDrop = (e) => {
  const files = e.dataTransfer?.files
  if (files?.length > 0 && files[0].type.indexOf('image') !== -1) {
    uploadRef.value?.handleStart(files[0])
    uploadRef.value?.submit()
  }
}

watch(dialogVisible, (val) => {
  if (val) {
    window.addEventListener('paste', handlePaste)
  } else {
    window.removeEventListener('paste', handlePaste)
  }
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
})

const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    petForm.image = response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败: ' + (response.msg || '未知错误'))
  }
}

// ---- CRUD 操作 ----
const handleSearch = () => { currentPage.value = 1; loadData() }

const resetSearch = () => {
  searchForm.name = ''
  searchForm.type = undefined
  searchForm.breed = ''
  searchForm.keyword = ''
  searchForm.status = undefined
  searchForm.source = undefined
  searchForm.gender = undefined
  searchForm.timeRange = []
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增宠物'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  resetForm()
  dialogTitle.value = '编辑宠物'
  Object.keys(petForm).forEach(key => {
    if (row[key] !== undefined) petForm[key] = row[key]
  })
  selectedHealthStatus.value = []
  if (row.healthStatus) {
    for (const [key] of Object.entries(healthStatusMap)) {
      const bit = Number(key)
      if ((row.healthStatus & bit) === bit) selectedHealthStatus.value.push(bit)
    }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!petFormRef.value) return
  await petFormRef.value.validate(async (valid) => {
    if (!valid) return
    petForm.healthStatus = selectedHealthStatus.value.reduce((acc, cur) => acc | cur, 0)
    petForm.adoptionFee = Number(petForm.adoptionFee || 0)
    try {
      const res = petForm.id ? await petApi.updatePet(petForm) : await petApi.addPet(petForm)
      if (res.code === 200) {
        ElMessage.success(petForm.id ? '修改成功' : '新增成功')
        dialogVisible.value = false
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

const resetForm = () => {
  petForm.id = undefined
  petForm.name = ''
  petForm.image = ''
  petForm.type = 1
  petForm.breed = ''
  petForm.age = 0
  petForm.gender = 1
  petForm.healthStatus = 0
  petForm.description = ''
  petForm.adoptionFee = 0
  petForm.source = 2
  petForm.status = 2
  petForm.ownerId = null
  selectedHealthStatus.value = []
  petFormRef.value?.clearValidate()
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除宠物"${row.name}"吗？此操作不可恢复。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await petApi.deletePet(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error(error?.response?.data?.msg || '删除失败')
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return
  ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 只宠物吗？此操作不可恢复。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await petApi.batchDeletePet(selectedIds.value)
      if (res.code === 200) {
        ElMessage.success('批量删除成功')
        selectedIds.value = []
        loadData()
      } else {
        ElMessage.error(res.msg || '批量删除失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error(error?.response?.data?.msg || '批量删除失败')
    }
  }).catch(() => {})
}

// ---- 审核 ----
const openAuditDialog = (row) => {
  auditTarget.value = { ...row }
  auditForm.status = 2
  auditDialogVisible.value = true
}

const resetAuditForm = () => {
  auditTarget.value = null
  auditForm.status = 2
}

const handleAuditSubmit = async () => {
  if (!auditTarget.value?.id) return
  auditSubmitting.value = true
  try {
    const res = await petApi.auditPet(auditTarget.value.id, auditForm.status)
    if (res.code === 200) {
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.msg || '审核失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || '审核失败')
  } finally {
    auditSubmitting.value = false
  }
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
      name: searchForm.name || undefined,
      type: searchForm.type,
      breed: searchForm.breed || undefined,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status,
      source: searchForm.source,
      gender: searchForm.gender,
      startTime: startTime || undefined,
      endTime: endTime || undefined
    }
    const res = await petApi.getPetPage(params)
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
    searchForm.status = toNumberOrUndefined(route.query.status)
    searchForm.timeRange = []
    currentPage.value = 1
    loadData()
  },
  { immediate: true }
)
</script>

<style scoped>
.pets-container {
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

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
