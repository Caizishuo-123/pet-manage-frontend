<template>
  <div class="service-container">
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>服务列表</span>
          <div>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedIds.length === 0">
              <el-icon><Delete /></el-icon> 批量删除
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon> 新增服务
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="请输入服务名称" clearable style="width:150px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width:120px">
            <el-option v-for="(label, value) in serviceTypeMap" :key="value" :label="label" :value="Number(value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width:120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon> 查询</el-button>
          <el-button @click="resetSearch"><el-icon><Refresh /></el-icon> 重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" style="width:100%" v-loading="loading" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="封面图" width="80" align="center">
          <template #default="scope">
            <el-image v-if="scope.row.imageUrl" :src="getCosUrl(scope.row.imageUrl)" style="width:50px;height:50px;border-radius:4px" fit="cover" :preview-src-list="[getCosUrl(scope.row.imageUrl)]" />
            <span v-else class="no-image">暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="服务名称" min-width="120" />
        <el-table-column prop="type" label="类型" width="90" align="center">
          <template #default="scope">
            <el-tag :type="getServiceTypeTag(scope.row.type)">{{ serviceTypeMap[scope.row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格(元)" width="100" align="center">
          <template #default="scope"><span class="price">¥{{ scope.row.price }}</span></template>
        </el-table-column>
        <el-table-column label="联系电话" width="130">
          <template #default="scope">{{ scope.row.contactPhone || '-' }}</template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(分钟)" width="100" align="center">
          <template #default="scope">{{ scope.row.duration || '-' }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="success" link size="small" @click="handleView(scope.row)"><el-icon><View /></el-icon> 查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)"><el-icon><Edit /></el-icon> 编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)"><el-icon><Delete /></el-icon> 删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10,20,50,100]" layout="total,sizes,prev,pager,next,jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="resetForm">
      <el-form ref="serviceFormRef" :model="serviceForm" :rules="serviceRules" label-width="100px">
        <el-form-item label="服务封面" prop="imageUrl">
          <el-upload ref="uploadRef" class="avatar-uploader" action="/cos/upload?type=service" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" @drop.prevent="handleDrop" @dragover.prevent>
            <el-image v-if="serviceForm.imageUrl" :src="getCosUrl(serviceForm.imageUrl)" class="avatar" :preview-src-list="[getCosUrl(serviceForm.imageUrl)]" fit="cover" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="服务名称" prop="name"><el-input v-model="serviceForm.name" placeholder="请输入服务名称" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="服务类型" prop="type"><el-select v-model="serviceForm.type" placeholder="请选择类型" style="width:100%"><el-option v-for="(l,v) in serviceTypeMap" :key="v" :label="l" :value="Number(v)" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="价格(元)" prop="price"><el-input-number v-model="serviceForm.price" :min="0" :precision="2" :step="10" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="时长(分钟)" prop="duration"><el-input-number v-model="serviceForm.duration" :min="0" :max="1440" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="serviceForm.contactPhone" placeholder="请输入联系电话" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="排序权重" prop="sort"><el-input-number v-model="serviceForm.sort" :min="0" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="状态" prop="status"><el-radio-group v-model="serviceForm.status"><el-radio :value="1">启用</el-radio><el-radio :value="0">禁用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="服务描述" prop="description"><el-input v-model="serviceForm.description" type="textarea" :rows="3" placeholder="请输入服务描述" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>

    <el-dialog title="服务详情" v-model="viewDialogVisible" width="600px" destroy-on-close @close="viewService = {}">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ viewService.id }}</el-descriptions-item>
        <el-descriptions-item label="服务名称">{{ viewService.name }}</el-descriptions-item>
        <el-descriptions-item label="服务类型"><el-tag :type="getServiceTypeTag(viewService.type)">{{ serviceTypeMap[viewService.type] }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ viewService.price }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ viewService.duration ? viewService.duration + ' 分钟' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ viewService.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序权重">{{ viewService.sort }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag :type="viewService.status === 1 ? 'success' : 'danger'">{{ viewService.status === 1 ? '启用' : '禁用' }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="服务描述" :span="2">{{ viewService.description || '暂无描述' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewService.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ viewService.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="封面图" :span="2">
          <el-image v-if="viewService.imageUrl" :src="getCosUrl(viewService.imageUrl)" style="width:200px;height:200px" fit="cover" :preview-src-list="[getCosUrl(viewService.imageUrl)]" />
          <span v-else>暂无图片</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer><el-button @click="viewDialogVisible = false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { Search, Refresh, Plus, Edit, Delete, View, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { petServiceApi } from '@/api'
import { getCosUrl } from '@/utils/request'
import { beforeAvatarUpload } from '@/utils/upload'

const loading = ref(false); const currentPage = ref(1); const pageSize = ref(10); const total = ref(0)
const selectedIds = ref([])
const handleSelectionChange = (s) => { selectedIds.value = s.map(i => i.id) }
const searchForm = reactive({ name:'', type:undefined, status:undefined })
const serviceTypeMap = { 1:'美容', 2:'洗护', 3:'医疗', 4:'寄养', 5:'训练', 6:'接送' }
const getServiceTypeTag = (t) => ({ 1:'', 2:'success', 3:'danger', 4:'warning', 5:'info', 6:'primary' }[t] || '')
const viewDialogVisible = ref(false); const viewService = ref({})
const handleView = (r) => { viewService.value = {...r}; viewDialogVisible.value = true }
const dialogVisible = ref(false); const dialogTitle = ref('新增服务'); const serviceFormRef = ref(null); const uploadRef = ref(null)
const serviceForm = reactive({ id:undefined, name:'', type:1, price:0, duration:null, description:'', imageUrl:'', contactPhone:'', sort:0, status:1 })
const serviceRules = { name:[{required:true,message:'请输入服务名称',trigger:'blur'}], type:[{required:true,message:'请选择服务类型',trigger:'change'}], price:[{required:true,message:'请输入价格',trigger:'blur'}] }
const tableData = ref([])

const handlePaste = (e) => { if(!dialogVisible.value) return; const items = e.clipboardData?.items; if(!items) return; for(let i=0;i<items.length;i++){ if(items[i].type.indexOf('image')!==-1){ uploadRef.value?.handleStart(items[i].getAsFile()); uploadRef.value?.submit(); break } } }
const handleDrop = (e) => { const f = e.dataTransfer?.files; if(f?.length>0 && f[0].type.indexOf('image')!==-1){ uploadRef.value?.handleStart(f[0]); uploadRef.value?.submit() } }
watch(dialogVisible, (v) => { if(v) window.addEventListener('paste',handlePaste); else window.removeEventListener('paste',handlePaste) })
onUnmounted(() => { window.removeEventListener('paste',handlePaste) })
const handleAvatarSuccess = (r) => { if(r.code===200){ serviceForm.imageUrl=r.data; ElMessage.success('上传成功') } else ElMessage.error('上传失败: '+(r.msg||'未知错误')) }
const handleSearch = () => { currentPage.value=1; loadData() }
const resetSearch = () => { searchForm.name=''; searchForm.type=undefined; searchForm.status=undefined; currentPage.value=1; loadData() }
const handleAdd = () => { resetForm(); dialogTitle.value='新增服务'; dialogVisible.value=true }
const handleEdit = (row) => { resetForm(); dialogTitle.value='编辑服务'; Object.keys(serviceForm).forEach(k=>{ if(row[k]!==undefined)serviceForm[k]=row[k] }); dialogVisible.value=true }
const handleDelete = (row) => { ElMessageBox.confirm(`确认删除服务"${row.name}"吗？`,'提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).then(async()=>{ try{ const r=await petServiceApi.deleteService(row.id); if(r.code===200){ElMessage.success('删除成功');loadData()}else ElMessage.error(r.msg||'删除失败') }catch(e){ElMessage.error('删除失败')} }).catch(()=>{}) }
const handleBatchDelete = () => { if(!selectedIds.value.length)return; ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个服务吗？`,'提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).then(async()=>{ try{ const r=await petServiceApi.batchDeleteService(selectedIds.value); if(r.code===200){ElMessage.success('批量删除成功');selectedIds.value=[];loadData()}else ElMessage.error(r.msg||'批量删除失败') }catch(e){ElMessage.error('批量删除失败')} }).catch(()=>{}) }
const handleStatusChange = async (row) => { try{ const r=await petServiceApi.updateServiceStatus(row.id,row.status); if(r.code===200)ElMessage.success('状态更新成功'); else{row.status=row.status===1?0:1;ElMessage.error(r.msg||'状态更新失败')} }catch(e){row.status=row.status===1?0:1;ElMessage.error('状态更新失败')} }
const handleSubmit = async () => { if(!serviceFormRef.value)return; await serviceFormRef.value.validate(async(v)=>{ if(!v)return; try{ const r=serviceForm.id?await petServiceApi.updateService(serviceForm):await petServiceApi.addService(serviceForm); if(r.code===200){ElMessage.success(serviceForm.id?'修改成功':'新增成功');dialogVisible.value=false;loadData()}else ElMessage.error(r.msg||'操作失败') }catch(e){console.error(e)} }) }
const resetForm = () => { serviceForm.id=undefined;serviceForm.name='';serviceForm.type=1;serviceForm.price=0;serviceForm.duration=null;serviceForm.description='';serviceForm.imageUrl='';serviceForm.contactPhone='';serviceForm.sort=0;serviceForm.status=1;serviceFormRef.value?.clearValidate() }
const handleSizeChange = (v) => { pageSize.value=v; loadData() }
const handleCurrentChange = (v) => { currentPage.value=v; loadData() }
const loadData = async () => { loading.value=true; try{ const r=await petServiceApi.getServicePage({page:currentPage.value,pageSize:pageSize.value,name:searchForm.name||undefined,type:searchForm.type,status:searchForm.status}); if(r.code===200){tableData.value=r.data.records;total.value=parseInt(r.data.total)}else ElMessage.error(r.msg||'获取数据失败') }catch(e){ElMessage.error('获取数据失败')}finally{loading.value=false} }
onMounted(() => { loadData() })
</script>

<style scoped>
.service-container{display:flex;flex-direction:column;gap:20px}.table-card{border:none}.card-header{display:flex;justify-content:space-between;align-items:center}.pagination-container{margin-top:20px;display:flex;justify-content:flex-end}.price{color:#f56c6c;font-weight:bold}.no-image{color:#909399;font-size:12px}.avatar-uploader .el-upload{border:1px dashed var(--el-border-color);border-radius:6px;cursor:pointer;overflow:hidden}.avatar-uploader .el-upload:hover{border-color:var(--el-color-primary)}.avatar-uploader-icon{font-size:28px;color:#8c939d;width:178px;height:178px;text-align:center}.avatar{width:178px;height:178px;display:block}
</style>
