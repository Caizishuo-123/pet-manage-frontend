import request from '@/utils/request'

/**
 * 分页查询评论
 */
export function getCommentPage(params) {
  return request.get('/admin/comment/page', { params })
}

/**
 * 更新评论状态（屏蔽/恢复）
 */
export function updateCommentStatus(id, status) {
  return request.put('/admin/comment/status', null, { params: { id, status } })
}

/**
 * 删除评论
 */
export function deleteComment(id) {
  return request.delete(`/admin/comment/delete/${id}`)
}
