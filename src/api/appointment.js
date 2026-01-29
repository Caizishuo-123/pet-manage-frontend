/**
 * 服务预约管理 API
 */
import request from '@/utils/request'

/**
 * 分页获取预约列表
 * @param {Object} params - 查询参数
 * @param {number} [params.userId] - 用户ID
 * @param {number} [params.petId] - 宠物ID
 * @param {number} [params.serviceId] - 服务ID
 * @param {number} [params.status] - 状态：1-已预约 2-已完成 3-已取消
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise}
 */
export function getAppointmentPage(params) {
  return request.get('/admin/appointment/page', { params })
}

/**
 * 获取预约详情
 * @param {number} id - 预约ID
 * @returns {Promise}
 */
export function getAppointmentDetail(id) {
  return request.get(`/admin/appointment/${id}`)
}

/**
 * 更新预约状态
 * @param {number} id - 预约ID
 * @param {number} status - 状态：1-已预约 2-已完成 3-已取消
 * @returns {Promise}
 */
export function updateAppointmentStatus(id, status) {
  return request.put('/admin/appointment/status', null, { params: { id, status } })
}

/**
 * 删除预约记录
 * @param {number} id - 预约ID
 * @returns {Promise}
 */
export function deleteAppointment(id) {
  return request.delete(`/admin/appointment/delete/${id}`)
}
