<template>
  <div class="community-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 帖子管理 Tab -->
      <el-tab-pane label="帖子管理" name="post">
        <el-card class="table-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>帖子列表</span>
              <el-button type="primary" @click="handleAddPost">
                <el-icon>
                  <Plus />
                </el-icon> 发布公告
              </el-button>
            </div>
          </template>

          <el-form :inline="true" :model="postSearchForm" class="search-form">
            <el-form-item label="标题">
              <el-input v-model="postSearchForm.title" placeholder="请输入标题" clearable style="width: 150px" />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="postSearchForm.type" placeholder="请选择类型" clearable style="width: 120px">
                <el-option label="普通帖子" :value="1" />
                <el-option label="公告" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="postSearchForm.status" placeholder="请选择状态" clearable style="width: 120px">
                <el-option label="正常" :value="1" />
                <el-option label="屏蔽" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handlePostSearch">
                <el-icon>
                  <Search />
                </el-icon> 查询
              </el-button>
              <el-button @click="resetPostSearch">
                <el-icon>
                  <Refresh />
                </el-icon> 重置
              </el-button>
            </el-form-item>
          </el-form>

          <el-table :data="postTableData" style="width: 100%" v-loading="postLoading" border>
            <el-table-column prop="id" label="ID" width="80" align="center" />

            <el-table-column prop="username" label="发帖用户" width="120" />

            <el-table-column prop="type" label="类型" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.type === 2 ? 'danger' : ''">
                  {{ postTypeMap[scope.row.type] }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />

            <el-table-column prop="likeCount" label="点赞数" width="100" align="center">
              <template #default="scope">
                <el-tag type="warning" effect="plain">
                  <el-icon style="vertical-align: middle;">
                    <Star />
                  </el-icon> {{ scope.row.likeCount }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '正常' : '屏蔽' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="createTime" label="创建时间" width="180" />

            <el-table-column prop="updateTime" label="更新时间" width="180" />

            <el-table-column label="操作" width="280" align="center" fixed="right">
              <template #default="scope">
                <el-button type="success" link size="small" @click="handleViewPost(scope.row)">
                  <el-icon>
                    <View />
                  </el-icon> 详情
                </el-button>
                <el-button :type="scope.row.status === 1 ? 'warning' : 'primary'" link size="small"
                  @click="handleTogglePostStatus(scope.row)">
                  <el-icon>
                    <component :is="scope.row.status === 1 ? 'Hide' : 'View'" />
                  </el-icon> {{ scope.row.status === 1 ? '屏蔽' : '恢复' }}
                </el-button>
                <el-button type="info" link size="small" @click="handleEditLikeCount(scope.row)">
                  <el-icon>
                    <Star />
                  </el-icon> 点赞
                </el-button>
                <el-button type="danger" link size="small" @click="handleDeletePost(scope.row)">
                  <el-icon>
                    <Delete />
                  </el-icon> 删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination v-model:current-page="postCurrentPage" v-model:page-size="postPageSize"
              :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="postTotal"
              @size-change="handlePostSizeChange" @current-change="handlePostCurrentChange" />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 评论管理 Tab -->
      <el-tab-pane label="评论管理" name="comment">
        <el-card class="table-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>评论列表</span>
            </div>
          </template>

          <el-form :inline="true" :model="commentSearchForm" class="search-form">
            <el-form-item label="帖子ID">
              <el-input v-model="commentSearchForm.postId" placeholder="请输入帖子ID" clearable style="width: 120px"
                type="number" />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="commentSearchForm.status" placeholder="请选择状态" clearable style="width: 120px">
                <el-option label="正常" :value="1" />
                <el-option label="屏蔽" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleCommentSearch">
                <el-icon>
                  <Search />
                </el-icon> 查询
              </el-button>
              <el-button @click="resetCommentSearch">
                <el-icon>
                  <Refresh />
                </el-icon> 重置
              </el-button>
            </el-form-item>
          </el-form>

          <el-table :data="commentTableData" style="width: 100%" v-loading="commentLoading" border>
            <el-table-column prop="id" label="ID" width="80" align="center" />

            <el-table-column prop="postTitle" label="所属帖子" min-width="150" show-overflow-tooltip />

            <el-table-column prop="username" label="评论用户" width="120" />

            <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip />

            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '正常' : '屏蔽' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="createTime" label="创建时间" width="180" />

            <el-table-column prop="updateTime" label="更新时间" width="180" />

            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="scope">
                <el-button :type="scope.row.status === 1 ? 'warning' : 'primary'" link size="small"
                  @click="handleToggleCommentStatus(scope.row)">
                  <el-icon>
                    <component :is="scope.row.status === 1 ? 'Hide' : 'View'" />
                  </el-icon> {{ scope.row.status === 1 ? '屏蔽' : '恢复' }}
                </el-button>
                <el-button type="danger" link size="small" @click="handleDeleteComment(scope.row)">
                  <el-icon>
                    <Delete />
                  </el-icon> 删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination v-model:current-page="commentCurrentPage" v-model:page-size="commentPageSize"
              :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="commentTotal"
              @size-change="handleCommentSizeChange" @current-change="handleCommentCurrentChange" />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 发布公告弹窗 -->
    <el-dialog title="发布公告" v-model="postDialogVisible" width="600px" @close="resetPostForm">
      <el-form ref="postFormRef" :model="postForm" :rules="postRules" label-width="100px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="postForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input v-model="postForm.content" type="textarea" :rows="5" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="公告图片">
          <el-upload class="avatar-uploader" action="/cos/upload?type=post" :show-file-list="false"
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" @drop.prevent="handleDrop"
            @dragover.prevent>
            <img v-if="postForm.imageUrl" :src="getCosUrl(postForm.imageUrl)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG/PNG/WEBP 格式，不超过 5MB</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="postDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitPost">发布</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 帖子详情弹窗 -->
    <el-dialog title="帖子详情" v-model="viewPostDialogVisible" width="700px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="帖子ID">{{ viewPost.id }}</el-descriptions-item>
        <el-descriptions-item label="帖子类型">
          <el-tag :type="viewPost.type === 2 ? 'danger' : ''">{{ postTypeMap[viewPost.type] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发帖用户">{{ viewPost.username }}</el-descriptions-item>
        <el-descriptions-item label="点赞数">
          <el-tag type="warning" effect="plain">{{ viewPost.likeCount }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="帖子状态">
          <el-tag :type="viewPost.status === 1 ? 'success' : 'danger'">
            {{ viewPost.status === 1 ? '正常' : '屏蔽' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewPost.createTime }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ viewPost.title }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">
          <div class="post-content">{{ viewPost.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="图片" :span="2" v-if="viewPost.imageUrl">
          <el-image :src="getCosUrl(viewPost.imageUrl)" style="max-width: 300px; max-height: 300px" fit="contain"
            :preview-src-list="[getCosUrl(viewPost.imageUrl)]" />
        </el-descriptions-item>
      </el-descriptions>

      <!-- 帖子评论列表 -->
      <el-divider content-position="left">评论列表</el-divider>
      <el-table :data="postComments" v-loading="postCommentsLoading" border size="small" max-height="300">
        <el-table-column prop="username" label="用户" width="100" />
        <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 1 ? '正常' : '屏蔽' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="160" />
      </el-table>
      <div v-if="postComments.length === 0 && !postCommentsLoading" class="no-comments">暂无评论</div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewPostDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改点赞数弹窗 -->
    <el-dialog title="修改点赞数" v-model="likeCountDialogVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="当前点赞">{{ currentLikePost.likeCount }}</el-form-item>
        <el-form-item label="新点赞数">
          <el-input-number v-model="newLikeCount" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="likeCountDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdateLikeCount">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { Search, Refresh, Plus, View, Delete, Star, Hide, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { postApi, commentApi } from '@/api'
import request, { getCosUrl } from '@/utils/request'

const activeTab = ref('post')

// ==================== 帖子管理 ====================
const postLoading = ref(false)
const postCurrentPage = ref(1)
const postPageSize = ref(10)
const postTotal = ref(0)
const postTableData = ref([])

const postSearchForm = reactive({
  title: '',
  type: undefined,
  status: undefined
})

const postTypeMap = {
  1: '普通帖子',
  2: '公告'
}

const handleTabChange = (tab) => {
  if (tab === 'post' && postTableData.value.length === 0) {
    loadPostData()
  } else if (tab === 'comment' && commentTableData.value.length === 0) {
    loadCommentData()
  }
}

const handlePostSearch = () => {
  postCurrentPage.value = 1
  loadPostData()
}

const resetPostSearch = () => {
  postSearchForm.title = ''
  postSearchForm.type = undefined
  postSearchForm.status = undefined
  postCurrentPage.value = 1
  loadPostData()
}

const handlePostSizeChange = (val) => {
  postPageSize.value = val
  loadPostData()
}

const handlePostCurrentChange = (val) => {
  postCurrentPage.value = val
  loadPostData()
}

const loadPostData = async () => {
  postLoading.value = true
  try {
    const params = {
      page: postCurrentPage.value,
      pageSize: postPageSize.value,
      title: postSearchForm.title || undefined,
      type: postSearchForm.type,
      status: postSearchForm.status
    }
    const res = await postApi.getPostPage(params)
    if (res.code === 200) {
      postTableData.value = res.data.records
      postTotal.value = parseInt(res.data.total)
    } else {
      ElMessage.error(res.msg || '获取数据失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取数据失败')
  } finally {
    postLoading.value = false
  }
}

// 发布公告
const postDialogVisible = ref(false)
const postFormRef = ref(null)
const postForm = reactive({
  title: '',
  content: '',
  imageUrl: ''
})
const postRules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
}

const handleAddPost = () => {
  resetPostForm()
  postDialogVisible.value = true
}

const resetPostForm = () => {
  postForm.title = ''
  postForm.content = ''
  postForm.imageUrl = ''
  if (postFormRef.value) {
    postFormRef.value.clearValidate()
  }
}

// 图片上传相关
const customUpload = async (file) => {
  if (!beforeAvatarUpload(file)) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await request.post('/cos/upload?type=post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    handleAvatarSuccess(res)
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

// 粘贴处理
const handlePaste = (e) => {
  if (!postDialogVisible.value) return
  const items = e.clipboardData && e.clipboardData.items
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        customUpload(file)
        break
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

// 监听 Dialog 打开状态
watch(postDialogVisible, (val) => {
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
  if (response.code === 200) {
    postForm.imageUrl = response.data
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

const handleSubmitPost = async () => {
  if (!postFormRef.value) return
  await postFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await postApi.addPost({
          title: postForm.title,
          content: postForm.content,
          imageUrl: postForm.imageUrl || null,
          type: 2 // 公告
        })
        if (res.code === 200) {
          ElMessage.success('发布成功')
          postDialogVisible.value = false
          loadPostData()
        } else {
          ElMessage.error(res.msg || '发布失败')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('发布失败')
      }
    }
  })
}

// 查看帖子详情
const viewPostDialogVisible = ref(false)
const viewPost = ref({})
const postComments = ref([])
const postCommentsLoading = ref(false)

const handleViewPost = async (row) => {
  viewPost.value = row
  viewPostDialogVisible.value = true
  // 加载该帖子的评论
  postCommentsLoading.value = true
  try {
    const res = await commentApi.getCommentPage({ postId: row.id, pageSize: 50 })
    if (res.code === 200) {
      postComments.value = res.data.records
    }
  } catch (error) {
    console.error(error)
  } finally {
    postCommentsLoading.value = false
  }
}

// 屏蔽/恢复帖子
const handleTogglePostStatus = (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '屏蔽' : '恢复'
  ElMessageBox.confirm(`确认${action}该帖子吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await postApi.updatePostStatus(row.id, newStatus)
      if (res.code === 200) {
        ElMessage.success(`${action}成功`)
        loadPostData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  })
}

// 修改点赞数
const likeCountDialogVisible = ref(false)
const currentLikePost = ref({})
const newLikeCount = ref(0)

const handleEditLikeCount = (row) => {
  currentLikePost.value = row
  newLikeCount.value = row.likeCount
  likeCountDialogVisible.value = true
}

const confirmUpdateLikeCount = async () => {
  try {
    const res = await postApi.updateLikeCount(currentLikePost.value.id, newLikeCount.value)
    if (res.code === 200) {
      ElMessage.success('点赞数更新成功')
      likeCountDialogVisible.value = false
      loadPostData()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

// 删除帖子
const handleDeletePost = (row) => {
  ElMessageBox.confirm('确认删除该帖子吗? 帖子下的评论也会被删除。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await postApi.deletePost(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadPostData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('删除失败')
    }
  })
}

// ==================== 评论管理 ====================
const commentLoading = ref(false)
const commentCurrentPage = ref(1)
const commentPageSize = ref(10)
const commentTotal = ref(0)
const commentTableData = ref([])

const commentSearchForm = reactive({
  postId: '',
  status: undefined
})

const handleCommentSearch = () => {
  commentCurrentPage.value = 1
  loadCommentData()
}

const resetCommentSearch = () => {
  commentSearchForm.postId = ''
  commentSearchForm.status = undefined
  commentCurrentPage.value = 1
  loadCommentData()
}

const handleCommentSizeChange = (val) => {
  commentPageSize.value = val
  loadCommentData()
}

const handleCommentCurrentChange = (val) => {
  commentCurrentPage.value = val
  loadCommentData()
}

const loadCommentData = async () => {
  commentLoading.value = true
  try {
    const params = {
      page: commentCurrentPage.value,
      pageSize: commentPageSize.value,
      postId: commentSearchForm.postId || undefined,
      status: commentSearchForm.status
    }
    const res = await commentApi.getCommentPage(params)
    if (res.code === 200) {
      commentTableData.value = res.data.records
      commentTotal.value = parseInt(res.data.total)
    } else {
      ElMessage.error(res.msg || '获取数据失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取数据失败')
  } finally {
    commentLoading.value = false
  }
}

// 屏蔽/恢复评论
const handleToggleCommentStatus = (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '屏蔽' : '恢复'
  ElMessageBox.confirm(`确认${action}该评论吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await commentApi.updateCommentStatus(row.id, newStatus)
      if (res.code === 200) {
        ElMessage.success(`${action}成功`)
        loadCommentData()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  })
}

// 删除评论
const handleDeleteComment = (row) => {
  ElMessageBox.confirm('确认删除该评论吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await commentApi.deleteComment(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadCommentData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadPostData()
})
</script>

<style scoped>
.community-container {
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

.post-content {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.no-comments {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.el-divider {
  margin: 16px 0;
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
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
