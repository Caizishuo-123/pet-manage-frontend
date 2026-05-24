<template>
  <div class="community-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="帖子管理" name="post">
        <el-card class="table-card" shadow="never">
          <template #header><div class="card-header"><span>帖子列表</span><el-button type="primary" @click="handleAddPost"><el-icon><Plus /></el-icon> 发布公告</el-button></div></template>

          <el-form :inline="true" :model="postSearchForm" class="search-form">
            <el-form-item label="标题"><el-input v-model="postSearchForm.title" placeholder="请输入标题" clearable style="width:150px" /></el-form-item>
            <el-form-item label="关键词"><el-input v-model="postSearchForm.keyword" placeholder="标题/内容" clearable style="width:160px" /></el-form-item>
            <el-form-item label="类型"><el-select v-model="postSearchForm.type" placeholder="请选择" clearable style="width:120px"><el-option label="普通帖子" :value="1" /><el-option label="公告" :value="2" /></el-select></el-form-item>
            <el-form-item label="分类"><el-select v-model="postSearchForm.category" placeholder="请选择" clearable style="width:120px"><el-option v-for="(l,v) in postCategoryMap" :key="v" :label="l" :value="Number(v)" /></el-select></el-form-item>
            <el-form-item label="状态"><el-select v-model="postSearchForm.status" placeholder="请选择" clearable style="width:120px"><el-option label="正常" :value="1" /><el-option label="屏蔽" :value="0" /></el-select></el-form-item>
            <el-form-item label="创建时间"><el-date-picker v-model="postSearchForm.timeRange" type="datetimerange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD HH:mm:ss" clearable style="width:300px" /></el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handlePostSearch"><el-icon><Search /></el-icon> 查询</el-button>
              <el-button @click="resetPostSearch"><el-icon><Refresh /></el-icon> 重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="postTableData" style="width:100%" v-loading="postLoading" border>
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="username" label="发帖用户" width="110" />
            <el-table-column prop="type" label="类型" width="90" align="center"><template #default="scope"><el-tag :type="scope.row.type===2?'danger':''">{{ postTypeMap[scope.row.type] }}</el-tag></template></el-table-column>
            <el-table-column prop="category" label="分类" width="100" align="center"><template #default="scope"><el-tag effect="plain">{{ postCategoryMap[scope.row.category] || '其他' }}</el-tag></template></el-table-column>
            <el-table-column prop="title" label="标题" min-width="170" show-overflow-tooltip />
            <el-table-column prop="likeCount" label="点赞数" width="95" align="center"><template #default="scope"><el-tag type="warning" effect="plain"><span style="display:inline-flex;align-items:center"><el-icon><Star /></el-icon><span style="margin-left:4px">{{scope.row.likeCount}}</span></span></el-tag></template></el-table-column>
            <el-table-column prop="status" label="状态" width="90" align="center"><template #default="scope"><el-tag :type="scope.row.status===1?'success':'danger'">{{ scope.row.status===1?'正常':'屏蔽' }}</el-tag></template></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="170" />
            <el-table-column label="操作" width="260" align="center" fixed="right">
              <template #default="scope">
                <el-button type="success" link size="small" @click="handleViewPost(scope.row)"><el-icon><View /></el-icon> 详情</el-button>
                <el-button :type="scope.row.status===1?'warning':'primary'" link size="small" @click="handleTogglePostStatus(scope.row)"><el-icon><component :is="scope.row.status===1?'Hide':'View'" /></el-icon> {{scope.row.status===1?'屏蔽':'恢复'}}</el-button>
                <el-button type="info" link size="small" @click="handleEditLikeCount(scope.row)"><el-icon><Star /></el-icon> 点赞</el-button>
                <el-button type="danger" link size="small" @click="handleDeletePost(scope.row)"><el-icon><Delete /></el-icon> 删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container"><el-pagination v-model:current-page="postCurrentPage" v-model:page-size="postPageSize" :page-sizes="[10,20,50,100]" layout="total,sizes,prev,pager,next,jumper" :total="postTotal" @size-change="handlePostSizeChange" @current-change="handlePostCurrentChange" /></div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="评论管理" name="comment">
        <el-card class="table-card" shadow="never">
          <template #header><div class="card-header"><span>评论列表</span></div></template>
          <el-form :inline="true" :model="commentSearchForm" class="search-form">
            <el-form-item label="帖子ID"><el-input v-model="commentSearchForm.postId" placeholder="请输入帖子ID" clearable style="width:120px" type="number" /></el-form-item>
            <el-form-item label="关键词"><el-input v-model="commentSearchForm.keyword" placeholder="评论内容" clearable style="width:160px" /></el-form-item>
            <el-form-item label="状态"><el-select v-model="commentSearchForm.status" placeholder="请选择" clearable style="width:120px"><el-option label="正常" :value="1" /><el-option label="屏蔽" :value="0" /></el-select></el-form-item>
            <el-form-item label="创建时间"><el-date-picker v-model="commentSearchForm.timeRange" type="datetimerange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD HH:mm:ss" clearable style="width:300px" /></el-form-item>
            <el-form-item><el-button type="primary" @click="handleCommentSearch"><el-icon><Search /></el-icon> 查询</el-button><el-button @click="resetCommentSearch"><el-icon><Refresh /></el-icon> 重置</el-button></el-form-item>
          </el-form>
          <el-table :data="commentTableData" style="width:100%" v-loading="commentLoading" border>
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="postTitle" label="所属帖子" min-width="140" show-overflow-tooltip />
            <el-table-column prop="username" label="评论用户" width="110" />
            <el-table-column prop="content" label="评论内容" min-width="180" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="90" align="center"><template #default="scope"><el-tag :type="scope.row.status===1?'success':'danger'">{{ scope.row.status===1?'正常':'屏蔽' }}</el-tag></template></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="170" />
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="scope">
                <el-button :type="scope.row.status===1?'warning':'primary'" link size="small" @click="handleToggleCommentStatus(scope.row)"><el-icon><component :is="scope.row.status===1?'Hide':'View'" /></el-icon> {{scope.row.status===1?'屏蔽':'恢复'}}</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteComment(scope.row)"><el-icon><Delete /></el-icon> 删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container"><el-pagination v-model:current-page="commentCurrentPage" v-model:page-size="commentPageSize" :page-sizes="[10,20,50,100]" layout="total,sizes,prev,pager,next,jumper" :total="commentTotal" @size-change="handleCommentSizeChange" @current-change="handleCommentCurrentChange" /></div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 发布公告弹窗 -->
    <el-dialog title="发布公告" v-model="postDialogVisible" width="600px" @close="resetPostForm">
      <el-form ref="postFormRef" :model="postForm" :rules="postRules" label-width="100px">
        <el-form-item label="公告标题" prop="title"><el-input v-model="postForm.title" placeholder="请输入公告标题" /></el-form-item>
        <el-form-item label="公告分类" prop="category"><el-select v-model="postForm.category" placeholder="请选择分类" style="width:100%"><el-option v-for="(l,v) in postCategoryMap" :key="v" :label="l" :value="Number(v)" /></el-select></el-form-item>
        <el-form-item label="公告内容" prop="content"><el-input v-model="postForm.content" type="textarea" :rows="5" placeholder="请输入公告内容" /></el-form-item>
        <el-form-item label="公告图片">
          <el-upload ref="uploadRef" class="avatar-uploader" action="/cos/upload?type=post" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" @drop.prevent="handleDrop" @dragover.prevent>
            <img v-if="postForm.imageUrl" :src="getCosUrl(postForm.imageUrl)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG/PNG/WEBP 格式，不超过 5MB</div>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="postDialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmitPost">发布</el-button></template>
    </el-dialog>

    <!-- 帖子详情弹窗 -->
    <el-dialog title="帖子详情" v-model="viewPostDialogVisible" width="750px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="帖子ID">{{ viewPost.id }}</el-descriptions-item>
        <el-descriptions-item label="帖子类型"><el-tag :type="viewPost.type===2?'danger':''">{{ postTypeMap[viewPost.type] }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="帖子分类"><el-tag effect="plain">{{ postCategoryMap[viewPost.category] || '其他' }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="发帖用户">{{ viewPost.username }}</el-descriptions-item>
        <el-descriptions-item label="点赞数"><el-tag type="warning" effect="plain">{{ viewPost.likeCount }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="帖子状态"><el-tag :type="viewPost.status===1?'success':'danger'">{{ viewPost.status===1?'正常':'屏蔽' }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewPost.createTime }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ viewPost.title }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2"><div class="post-content">{{ viewPost.content }}</div></el-descriptions-item>
        <el-descriptions-item label="图片" :span="2" v-if="viewPost.imageUrl"><el-image :src="getCosUrl(viewPost.imageUrl)" style="max-width:300px;max-height:300px" fit="contain" :preview-src-list="[getCosUrl(viewPost.imageUrl)]" /></el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">评论列表</el-divider>
      <el-table :data="postComments" v-loading="postCommentsLoading" border size="small" max-height="300">
        <el-table-column prop="username" label="用户" width="100" />
        <el-table-column prop="content" label="评论内容" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center"><template #default="scope"><el-tag :type="scope.row.status===1?'success':'danger'" size="small">{{ scope.row.status===1?'正常':'屏蔽' }}</el-tag></template></el-table-column>
        <el-table-column prop="createTime" label="时间" width="160" />
        <el-table-column label="操作" width="140" align="center">
          <template #default="scope">
            <el-button :type="scope.row.status===1?'warning':'primary'" link size="small" @click="toggleDetailComment(scope.row)">{{ scope.row.status===1?'屏蔽':'恢复' }}</el-button>
            <el-button type="danger" link size="small" @click="deleteDetailComment(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="postComments.length===0&&!postCommentsLoading" class="no-comments">暂无评论</div>
      <div class="comment-pagination" v-if="postCommentTotal>postCommentPageSize">
        <el-pagination v-model:current-page="postCommentPage" :page-size="postCommentPageSize" :total="postCommentTotal" layout="prev,pager,next" size="small" @current-change="loadPostComments" />
      </div>

      <template #footer><el-button @click="viewPostDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 修改点赞数弹窗 -->
    <el-dialog title="修改点赞数" v-model="likeCountDialogVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="当前点赞">{{ currentLikePost.likeCount }}</el-form-item>
        <el-form-item label="新点赞数"><el-input-number v-model="newLikeCount" :min="0" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="likeCountDialogVisible=false">取消</el-button><el-button type="primary" @click="confirmUpdateLikeCount">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted } from 'vue'
import { Search, Refresh, Plus, View, Delete, Star, Hide, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { postApi, commentApi } from '@/api'
import { getCosUrl } from '@/utils/request'
import { toStringOrEmpty, toNumberOrUndefined } from '@/utils/query'
import { beforeAvatarUpload } from '@/utils/upload'
import { useRoute } from 'vue-router'

const activeTab=ref('post');const route=useRoute()
const postLoading=ref(false);const postCurrentPage=ref(1);const postPageSize=ref(10);const postTotal=ref(0);const postTableData=ref([])
const postSearchForm=reactive({title:'',keyword:'',type:undefined,category:undefined,status:undefined,timeRange:[]})
const postTypeMap={1:'普通帖子',2:'公告'};const postCategoryMap={1:'分享',2:'求助',3:'科普',4:'讨论',5:'其他'}
const resolveTab=(v)=>(toStringOrEmpty(v)==='comment'?'comment':'post')
const handleTabChange=(t)=>{if(t==='post'&&postTableData.value.length===0)loadPostData();else if(t==='comment'&&commentTableData.value.length===0)loadCommentData()}
const handlePostSearch=()=>{postCurrentPage.value=1;loadPostData()}
const resetPostSearch=()=>{postSearchForm.title='';postSearchForm.keyword='';postSearchForm.type=undefined;postSearchForm.category=undefined;postSearchForm.status=undefined;postSearchForm.timeRange=[];postCurrentPage.value=1;loadPostData()}
const handlePostSizeChange=(v)=>{postPageSize.value=v;loadPostData()}
const handlePostCurrentChange=(v)=>{postCurrentPage.value=v;loadPostData()}
const loadPostData=async()=>{postLoading.value=true;try{const[s,e]=postSearchForm.timeRange||[];const r=await postApi.getPostPage({page:postCurrentPage.value,pageSize:postPageSize.value,title:postSearchForm.title||undefined,keyword:postSearchForm.keyword||undefined,type:postSearchForm.type,category:postSearchForm.category,status:postSearchForm.status,startTime:s||undefined,endTime:e||undefined});if(r.code===200){postTableData.value=r.data.records;postTotal.value=parseInt(r.data.total)}else ElMessage.error(r.msg||'获取数据失败')}catch(e){ElMessage.error('获取数据失败')}finally{postLoading.value=false}}

const postDialogVisible=ref(false);const postFormRef=ref(null);const uploadRef=ref(null)
const postForm=reactive({title:'',content:'',imageUrl:'',category:1})
const postRules={title:[{required:true,message:'请输入公告标题',trigger:'blur'}],category:[{required:true,message:'请选择分类',trigger:'change'}],content:[{required:true,message:'请输入公告内容',trigger:'blur'}]}
const handleAddPost=()=>{resetPostForm();postDialogVisible.value=true}
const resetPostForm=()=>{postForm.title='';postForm.content='';postForm.imageUrl='';postForm.category=1;postFormRef.value?.clearValidate()}
const handlePaste=(e)=>{if(!postDialogVisible.value)return;const items=e.clipboardData?.items;if(!items)return;for(let i=0;i<items.length;i++){if(items[i].type.indexOf('image')!==-1){uploadRef.value?.handleStart(items[i].getAsFile());uploadRef.value?.submit();break}}}
const handleDrop=(e)=>{const f=e.dataTransfer?.files;if(f?.length>0&&f[0].type.indexOf('image')!==-1){uploadRef.value?.handleStart(f[0]);uploadRef.value?.submit()}}
watch(postDialogVisible,(v)=>{if(v)window.addEventListener('paste',handlePaste);else window.removeEventListener('paste',handlePaste)})
onUnmounted(()=>{window.removeEventListener('paste',handlePaste)})
const handleAvatarSuccess=(r)=>{if(r.code===200){postForm.imageUrl=r.data;ElMessage.success('上传成功')}else ElMessage.error('上传失败: '+(r.msg||'未知错误'))}
const handleSubmitPost=async()=>{if(!postFormRef.value)return;await postFormRef.value.validate(async(v)=>{if(!v)return;try{const r=await postApi.addPost({title:postForm.title,content:postForm.content,imageUrl:postForm.imageUrl||null,type:2,category:postForm.category});if(r.code===200){ElMessage.success('发布成功');postDialogVisible.value=false;loadPostData()}else ElMessage.error(r.msg||'发布失败')}catch(e){ElMessage.error('发布失败')}})}

const viewPostDialogVisible=ref(false);const viewPost=ref({});const postComments=ref([]);const postCommentsLoading=ref(false)
const postCommentPage=ref(1);const postCommentPageSize=10;const postCommentTotal=ref(0)
const currentViewPostId=ref(null)
const handleViewPost=async(row)=>{viewPost.value=row;viewPostDialogVisible.value=true;currentViewPostId.value=row.id;postCommentPage.value=1;loadPostComments()}
const loadPostComments=async()=>{if(!currentViewPostId.value)return;postCommentsLoading.value=true;try{const r=await commentApi.getCommentPage({postId:currentViewPostId.value,page:postCommentPage.value,pageSize:postCommentPageSize});if(r.code===200){postComments.value=r.data.records;postCommentTotal.value=parseInt(r.data.total)}}catch(e){console.error(e)}finally{postCommentsLoading.value=false}}
const toggleDetailComment=async(row)=>{const ns=row.status===1?0:1;const a=ns===0?'屏蔽':'恢复';try{const r=await commentApi.updateCommentStatus(row.id,ns);if(r.code===200){ElMessage.success(a+'成功');loadPostComments()}else ElMessage.error(r.msg||'操作失败')}catch(e){ElMessage.error('操作失败')}}
const deleteDetailComment=async(row)=>{ElMessageBox.confirm('确认删除该评论吗?','提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).then(async()=>{try{const r=await commentApi.deleteComment(row.id);if(r.code===200){ElMessage.success('删除成功');loadPostComments()}else ElMessage.error(r.msg||'删除失败')}catch(e){ElMessage.error('删除失败')}}).catch(()=>{})}

const handleTogglePostStatus=(row)=>{const ns=row.status===1?0:1;const a=ns===0?'屏蔽':'恢复';ElMessageBox.confirm(`确认${a}该帖子吗?`,'提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).then(async()=>{try{const r=await postApi.updatePostStatus(row.id,ns);if(r.code===200){ElMessage.success(a+'成功');loadPostData()}else ElMessage.error(r.msg||'操作失败')}catch(e){ElMessage.error('操作失败')}})}
const likeCountDialogVisible=ref(false);const currentLikePost=ref({});const newLikeCount=ref(0)
const handleEditLikeCount=(row)=>{currentLikePost.value=row;newLikeCount.value=row.likeCount;likeCountDialogVisible.value=true}
const confirmUpdateLikeCount=async()=>{try{const r=await postApi.updateLikeCount(currentLikePost.value.id,newLikeCount.value);if(r.code===200){ElMessage.success('点赞数更新成功');likeCountDialogVisible.value=false;loadPostData()}else ElMessage.error(r.msg||'操作失败')}catch(e){ElMessage.error('操作失败')}}
const handleDeletePost=(row)=>{ElMessageBox.confirm('确认删除该帖子吗? 帖子下的评论也会被删除。','提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).then(async()=>{try{const r=await postApi.deletePost(row.id);if(r.code===200){ElMessage.success('删除成功');loadPostData()}else ElMessage.error(r.msg||'删除失败')}catch(e){ElMessage.error('删除失败')}})}

const commentLoading=ref(false);const commentCurrentPage=ref(1);const commentPageSize=ref(10);const commentTotal=ref(0);const commentTableData=ref([])
const commentSearchForm=reactive({postId:'',status:undefined,keyword:'',timeRange:[]})
const handleCommentSearch=()=>{commentCurrentPage.value=1;loadCommentData()}
const resetCommentSearch=()=>{commentSearchForm.postId='';commentSearchForm.status=undefined;commentSearchForm.keyword='';commentSearchForm.timeRange=[];commentCurrentPage.value=1;loadCommentData()}
const handleCommentSizeChange=(v)=>{commentPageSize.value=v;loadCommentData()}
const handleCommentCurrentChange=(v)=>{commentCurrentPage.value=v;loadCommentData()}
const loadCommentData=async()=>{commentLoading.value=true;try{const[s,e]=commentSearchForm.timeRange||[];const r=await commentApi.getCommentPage({page:commentCurrentPage.value,pageSize:commentPageSize.value,postId:commentSearchForm.postId||undefined,status:commentSearchForm.status,keyword:commentSearchForm.keyword||undefined,startTime:s||undefined,endTime:e||undefined});if(r.code===200){commentTableData.value=r.data.records;commentTotal.value=parseInt(r.data.total)}else ElMessage.error(r.msg||'获取数据失败')}catch(e){ElMessage.error('获取数据失败')}finally{commentLoading.value=false}}
const handleToggleCommentStatus=(row)=>{const ns=row.status===1?0:1;const a=ns===0?'屏蔽':'恢复';ElMessageBox.confirm(`确认${a}该评论吗?`,'提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).then(async()=>{try{const r=await commentApi.updateCommentStatus(row.id,ns);if(r.code===200){ElMessage.success(a+'成功');loadCommentData()}else ElMessage.error(r.msg||'操作失败')}catch(e){ElMessage.error('操作失败')}})}
const handleDeleteComment=(row)=>{ElMessageBox.confirm('确认删除该评论吗?','提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'}).then(async()=>{try{const r=await commentApi.deleteComment(row.id);if(r.code===200){ElMessage.success('删除成功');loadCommentData()}else ElMessage.error(r.msg||'删除失败')}catch(e){ElMessage.error('删除失败')}})}

watch(()=>route.query,()=>{activeTab.value=resolveTab(route.query.tab);postSearchForm.title=toStringOrEmpty(route.query.title);postSearchForm.keyword=toStringOrEmpty(route.query.keyword);postSearchForm.type=toNumberOrUndefined(route.query.type);postSearchForm.category=toNumberOrUndefined(route.query.category);postSearchForm.status=activeTab.value==='post'?toNumberOrUndefined(route.query.status):undefined;postSearchForm.timeRange=[];commentSearchForm.postId=toStringOrEmpty(route.query.postId);commentSearchForm.keyword=toStringOrEmpty(route.query.keyword);commentSearchForm.status=activeTab.value==='comment'?toNumberOrUndefined(route.query.status):undefined;commentSearchForm.timeRange=[];postCurrentPage.value=1;commentCurrentPage.value=1;if(activeTab.value==='comment')loadCommentData();else loadPostData()},{immediate:true})
</script>

<style scoped>
.community-container{display:flex;flex-direction:column;gap:20px}.table-card{border:none}.card-header{display:flex;justify-content:space-between;align-items:center}.pagination-container{margin-top:20px;display:flex;justify-content:flex-end}.comment-pagination{margin-top:12px;display:flex;justify-content:flex-end}.post-content{white-space:pre-wrap;word-break:break-all;max-height:200px;overflow-y:auto}.no-comments{text-align:center;color:#909399;padding:20px 0}.el-divider{margin:16px 0}.avatar-uploader .el-upload{border:1px dashed var(--el-border-color);border-radius:6px;cursor:pointer;overflow:hidden}.avatar-uploader .el-upload:hover{border-color:var(--el-color-primary)}.avatar-uploader-icon{font-size:28px;color:#8c939d;width:178px;height:178px;text-align:center;line-height:178px}.avatar{width:178px;height:178px;display:block;object-fit:cover}.upload-tip{font-size:12px;color:#909399;margin-top:8px}
</style>
