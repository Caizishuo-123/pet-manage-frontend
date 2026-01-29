import request from '@/utils/request'

/**
 * 分页查询帖子
 */
export function getPostPage(params) {
  return request.get('/admin/post/page', { params })
}

/**
 * 获取帖子详情
 */
export function getPostDetail(id) {
  return request.get(`/admin/post/${id}`)
}

/**
 * 发布公告帖
 */
export function addPost(data) {
  return request.post('/admin/post/add', data)
}

/**
 * 更新帖子状态（屏蔽/恢复）
 */
export function updatePostStatus(id, status) {
  return request.put('/admin/post/status', null, { params: { id, status } })
}

/**
 * 修改点赞数
 */
export function updateLikeCount(id, likeCount) {
  return request.put('/admin/post/likeCount', null, { params: { id, likeCount } })
}

/**
 * 删除帖子
 */
export function deletePost(id) {
  return request.delete(`/admin/post/delete/${id}`)
}
