/**
 * 领养申请管理 API
 */
import request from '@/utils/request'

/**
 * 分页获取领养申请列表
 * @param {Object} params - 查询参数
 * @param {number} [params.userId] - 用户ID
 * @param {number} [params.petId] - 宠物ID
 * @param {number} [params.status] - 状态：1-待审核 2-待支付 3-已拒绝 4-已完成 5-已取消
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise}
 */
export function getAdoptionPage(params) {
  return request.get('/admin/adoption/page', { params })
}

/**
 * 获取申请详情
 * @param {number} id - 申请ID
 * @returns {Promise}
 */
export function getAdoptionDetail(id) {
  return request.get(`/admin/adoption/${id}`)
}

/**
 * 审核领养申请
 * @param {number} id - 申请ID
 * @param {number} status - 状态：2-待支付 3-拒绝 4-已完成
 * @returns {Promise}
 */
export function auditAdoption(id, status) {
  return request.put('/admin/adoption/audit', null, { params: { id, status } })
}

/**
 * 取消待支付的领养申请并释放宠物
 * @param {number} id - 申请ID
 * @returns {Promise}
 */
export function cancelAdoption(id) {
  return request.put('/admin/adoption/cancel', null, { params: { id } })
}

/**
 * 删除申请记录（仅允许删除已拒绝或已取消的）
 * @param {number} id - 申请ID
 * @returns {Promise}
 */
export function deleteAdoption(id) {
  return request.delete(`/admin/adoption/delete/${id}`)
}
