<template>
  <div class="pets-container">
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>宠物列表</span>
          <div>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedIds.length === 0">
              <el-icon>
                <Delete />
              </el-icon> 批量删除
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon>
                <Plus />
              </el-icon> 新增宠物
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="请输入宠物名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 120px">
            <el-option label="猫" :value="1" />
            <el-option label="狗" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="品种">
          <el-input v-model="searchForm.breed" placeholder="请输入品种" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="名称/品种/描述" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option v-for="(label, value) in petStatusMap" :key="value" :label="label" :value="Number(value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="searchForm.source" placeholder="请选择来源" clearable style="width: 120px">
            <el-option v-for="(label, value) in petSourceMap" :key="value" :label="label" :value="Number(value)" />
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

      <el-table :data="tableData" style="width: 100%" v-loading="loading" border
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column prop="name" label="名称" min-width="120" />

        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.type === 1 ? 'warning' : 'success'">{{ petTypeMap[scope.row.type] }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="breed" label="品种" width="120" />

        <el-table-column prop="age" label="年龄(月)" width="100" align="center" />

        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.gender === 1 ? '' : 'danger'" effect="plain">
              {{ petGenderMap[scope.row.gender] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getPetStatusType(scope.row.status)">
              {{ petStatusMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="source" label="来源" width="100" align="center">
          <template #default="scope">
            {{ petSourceMap[scope.row.source] }}
          </template>
        </el-table-column>

        <el-table-column prop="ownerId" label="所属用户ID" width="120" align="center">
          <template #default="scope">
            {{ scope.row.ownerId || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180" />

        <el-table-column prop="updateTime" label="更新时间" width="180" />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="success" link size="small" @click="handleView(scope.row)">
              <el-icon>
                <View />
              </el-icon> 查看
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">
              <el-icon>
                <Edit />
              </el-icon> 编辑
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="resetForm">
      <el-form ref="petFormRef" :model="petForm" :rules="petRules" label-width="100px">

        <el-form-item label="宠物图片" prop="image">
          <el-upload class="avatar-uploader" action="/cos/upload?type=pet" :show-file-list="false"
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" @drop.prevent="handleDrop"
            @dragover.prevent>
            <img v-if="petForm.image" :src="getCosUrl(petForm.image)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
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

        <el-form-item label="健康状态" prop="healthStatus">
          <el-checkbox-group v-model="selectedHealthStatus">
            <el-checkbox v-for="(label, value) in healthStatusMap" :key="value" :label="Number(value)">{{ label
            }}</el-checkbox>
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
    <el-dialog title="宠物详情" v-model="viewDialogVisible" width="600px" destroy-on-close @close="viewPet = {}">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="名称">{{ viewPet.name }}</el-descriptions-item>
        <el-descriptions-item label="健康状态">
          <el-tag v-for="item in getViewPetHealthStatusTags(viewPet.healthStatus)" :key="item.value" class="mr-2"
            style="margin-right: 5px;" :type="getHealthTagType(item.value)">
            {{ item.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ viewPet.description || '暂无描述' }}</el-descriptions-item>
        <el-descriptions-item label="图片">
          <el-image v-if="viewPet.image" :src="getCosUrl(viewPet.image)" style="width: 200px; height: 200px" fit="cover"
            :preview-src-list="[getCosUrl(viewPet.image)]">
            <template #error>
              <div class="image-slot">
                <el-icon>
                  <IconPicture />
                </el-icon>
              </div>
            </template>
          </el-image>
          <span v-else>暂无图片</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue'
import { Search, Refresh, Plus, Edit, Delete, View, Picture as IconPicture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { petApi } from '@/api'
import request, { getCosUrl } from '@/utils/request'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 批量删除相关
const selectedIds = ref([])
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

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

// 字典映射
const petTypeMap = {
  1: '猫',
  2: '狗'
}

const petGenderMap = {
  1: '公',
  2: '母'
}

const petStatusMap = {
  1: '用户拥有',
  2: '可领养',
  3: '已领养'
}

const petSourceMap = {
  1: '用户拥有',
  2: '平台发布'
}

const healthStatusMap = {
  1: '疫苗',
  2: '驱虫',
  4: '绝育',
  8: '健康',
  16: '慢性病',
  32: '观察中',
  64: '特殊照顾'
}

const getHealthTagType = (val) => {
  if (val >= 64) return 'danger'   // 大于等于64 -> 红色
  if (val >= 16) return 'warning'  // 大于等于16 -> 黄色
  return ''                        // 其他 -> 默认蓝色（如果想变绿可以用 'success'）
}

const getPetStatusType = (status) => {
  switch (status) {
    case 1: return 'info';
    case 2: return 'success';
    case 3: return 'warning';
    default: return '';
  }
}

// 查看详情相关
const viewDialogVisible = ref(false)
const viewPet = ref({})

const handleView = (row) => {
  viewPet.value = { ...row }
  viewDialogVisible.value = true
}

const getViewPetHealthStatusTags = (status) => {
  const tags = []
  if (status === undefined || status === null) return tags
  for (const [key, value] of Object.entries(healthStatusMap)) {
    const bit = Number(key)
    if ((status & bit) === bit) {
      tags.push({ value: bit, label: value })
    }
  }
  return tags
}

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增宠物')
const petFormRef = ref(null)

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
  source: 2, // 默认平台发布
  status: 2, // 默认可领养
  ownerId: null
})

// 用于处理 checkbox group 的数组
const selectedHealthStatus = ref([])

// 手动上传逻辑
const customUpload = async (file) => {
  if (!beforeAvatarUpload(file)) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await request.post('/cos/upload?type=pet', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    handleAvatarSuccess(res)
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

// 粘贴处理
const handlePaste = (e) => {
  if (!dialogVisible.value) return
  const items = e.clipboardData && e.clipboardData.items
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        customUpload(file)
        break // 只上传第一张
      }
    }
  }
}

// 拖拽处理
const handleDrop = (e) => {
  const files = e.dataTransfer.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.indexOf('image') !== -1) {
      customUpload(file)
    }
  }
}

// 监听 Dialog 打开状态，添加/移除粘贴事件
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

const handleAvatarSuccess = (response, uploadFile) => {
  // 适配后端返回结构 Result<String>
  if (response.code === 200) {
    petForm.image = response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败: ' + (response.msg || '未知错误'))
  }
}

const beforeAvatarUpload = (rawFile) => {
  const isValidFormat = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png' || rawFile.type === 'image/webp'
  const isLt5M = rawFile.size / 1024 / 1024 < 5

  if (!isValidFormat) {
    ElMessage.error('上传图片只能是 JPG/PNG/WEBP 格式!')
  }
  if (!isLt5M) {
    ElMessage.error('上传图片大小不能超过 5MB!')
  }
  return isValidFormat && isLt5M
}

const petRules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }]
}

// 列表数据 mock
const tableData = ref([])

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

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

  // 赋值
  Object.keys(petForm).forEach(key => {
    if (row[key] !== undefined) {
      petForm[key] = row[key]
    }
  })

  // 处理健康状态位运算转数组
  selectedHealthStatus.value = []
  for (const [key, value] of Object.entries(healthStatusMap)) {
    const bit = Number(key)
    if ((row.healthStatus & bit) === bit) {
      selectedHealthStatus.value.push(bit)
    }
  }

  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该宠物吗?', '提示', {
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
      ElMessage.error('删除失败')
    }
  })
}

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return

  ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个宠物吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await petApi.batchDeletePet(selectedIds.value)
      if (res.code === 200) {
        ElMessage.success('批量删除成功')
        selectedIds.value = [] // 清空选中
        loadData()
      } else {
        ElMessage.error(res.msg || '批量删除失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('批量删除失败')
    }
  })
}

const handleSubmit = async () => {
  if (!petFormRef.value) return
  await petFormRef.value.validate(async (valid) => {
    if (valid) {
      // 计算健康状态总值
      petForm.healthStatus = selectedHealthStatus.value.reduce((acc, cur) => acc | cur, 0)

      try {
        let res
        if (petForm.id) {
          res = await petApi.updatePet(petForm)
        } else {
          res = await petApi.addPet(petForm)
        }

        if (res.code === 200) {
          ElMessage.success(petForm.id ? '修改成功' : '新增成功')
          dialogVisible.value = false
          loadData()
        } else {
          ElMessage.error(res.msg || '操作失败')
        }
      } catch (error) {
        console.error(error)
      }
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
  petForm.source = 2
  petForm.status = 2
  petForm.ownerId = null
  selectedHealthStatus.value = []
  if (petFormRef.value) {
    petFormRef.value.clearValidate()
  }
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

onMounted(() => {
  loadData()
})
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
