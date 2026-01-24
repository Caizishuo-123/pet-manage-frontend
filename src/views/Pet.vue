<template>
  <div class="pets-container">
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>宠物列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon> 新增宠物
          </el-button>
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
          <el-tag v-for="tag in getViewPetHealthStatusTags(viewPet.healthStatus)" :key="tag" class="mr-2"
            style="margin-right: 5px;">
            {{ tag }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ viewPet.description || '暂无描述' }}</el-descriptions-item>
        <el-descriptions-item label="图片">
          <el-image v-if="viewPet.image" :src="viewPet.image" style="width: 200px; height: 200px" fit="cover"
            :preview-src-list="[viewPet.image]">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, Plus, Edit, Delete, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { petApi } from '@/api'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  name: '',
  type: undefined,
  breed: '',
  status: undefined,
  source: undefined,
  gender: undefined
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
      tags.push(value)
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
  searchForm.status = undefined
  searchForm.source = undefined
  searchForm.gender = undefined
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
    ElMessage.info('功能开发中...')
    // TODO: 调用删除接口
  })
}

const handleSubmit = async () => {
  if (!petFormRef.value) return
  await petFormRef.value.validate((valid) => {
    if (valid) {
      // 计算健康状态总值
      petForm.healthStatus = selectedHealthStatus.value.reduce((acc, cur) => acc | cur, 0)

      console.log('Submit:', petForm)
      ElMessage.success('操作成功 (演示)')
      dialogVisible.value = false
      loadData()
    }
  })
}

const resetForm = () => {
  petForm.id = undefined
  petForm.name = ''
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
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchForm.name || undefined,
      type: searchForm.type,
      breed: searchForm.breed || undefined,
      status: searchForm.status,
      source: searchForm.source,
      gender: searchForm.gender
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
</style>
