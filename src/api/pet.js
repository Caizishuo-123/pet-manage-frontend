/**
 * 宠物管理 API
 */
import request from '@/utils/request'

/**
 * 分页获取宠物列表
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 宠物名称
 * @param {number} [params.type] - 类型：1-猫 2-狗
 * @param {string} [params.breed] - 品种
 * @param {number} [params.status] - 状态
 * @param {number} [params.source] - 来源
 * @param {number} [params.gender] - 性别
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise}
 */
export function getPetPage(params) {
  return request.get('/admin/pet/page', { params })
}

/**
 * 新增宠物
 * @param {Object} data - 宠物信息
 * @returns {Promise}
 */
export function addPet(data) {
  return request.post('/admin/pet/add', data)
}

/**
 * 修改宠物
 * @param {Object} data - 宠物信息
 * @returns {Promise}
 */
export function updatePet(data) {
  return request.put('/admin/pet/update', data)
}

/**
 * 删除宠物
 * @param {number} id - 宠物ID
 * @returns {Promise}
 */
export function deletePet(id) {
  return request.delete(`/admin/pet/delete/${id}`)
}

/**
 * 批量删除宠物
 * @param {Array} ids - 宠物ID数组
 * @returns {Promise}
 */
export function batchDeletePet(ids) {
  return request.delete('/admin/pet/delete/batch', { data: ids })
}

/**
 * 审核送养宠物
 * @param {number} id - 宠物ID
 * @param {number} status - 审核结果状态：1-退回自养 2-通过上架 5-屏蔽
 * @returns {Promise}
 */
export function auditPet(id, status) {
  return request.put('/admin/pet/audit', null, {
    params: { id, status }
  })
}
