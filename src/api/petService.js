/**
 * 宠物服务管理 API
 */
import request from '@/utils/request'

/**
 * 分页获取服务列表
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 服务名称
 * @param {number} [params.type] - 服务类型：1-美容 2-洗护 3-医疗 4-寄养 5-训练 6-接送
 * @param {number} [params.status] - 状态：1-启用 0-禁用
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise}
 */
export function getServicePage(params) {
  return request.get('/admin/petService/page', { params })
}

/**
 * 获取服务详情
 * @param {number} id - 服务ID
 * @returns {Promise}
 */
export function getServiceById(id) {
  return request.get(`/admin/petService/${id}`)
}

/**
 * 新增服务
 * @param {Object} data - 服务信息
 * @returns {Promise}
 */
export function addService(data) {
  return request.post('/admin/petService/add', data)
}

/**
 * 修改服务
 * @param {Object} data - 服务信息
 * @returns {Promise}
 */
export function updateService(data) {
  return request.put('/admin/petService/update', data)
}

/**
 * 删除服务
 * @param {number} id - 服务ID
 * @returns {Promise}
 */
export function deleteService(id) {
  return request.delete(`/admin/petService/delete/${id}`)
}

/**
 * 批量删除服务
 * @param {Array} ids - 服务ID数组
 * @returns {Promise}
 */
export function batchDeleteService(ids) {
  return request.delete('/admin/petService/batch', { data: ids })
}

/**
 * 更新服务状态
 * @param {number} id - 服务ID
 * @param {number} status - 状态：1-启用 0-禁用
 * @returns {Promise}
 */
export function updateServiceStatus(id, status) {
  return request.put('/admin/petService/status', null, { params: { id, status } })
}

/**
 * 获取所有启用的服务（下拉选择用）
 * @returns {Promise}
 */
export function getEnabledServices() {
  return request.get('/admin/petService/list')
}
