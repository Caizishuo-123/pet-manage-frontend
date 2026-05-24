/**
 * 用户管理 API
 */
import request from '@/utils/request'

/**
 * 分页获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} [params.id] - 用户ID
 * @param {string} [params.username] - 用户名
 * @param {string} [params.phone] - 手机号
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise}
 */
export function getUserPage(params) {
  return request.get('/admin/user/page', { params })
}

/**
 * 切换用户状态（启用/禁用）
 * @param {number} id - 用户ID
 * @returns {Promise}
 */
export function toggleUserStatus(id) {
  return request.put('/admin/user/toggleStatus', null, {
    params: { id }
  })
}

/**
 * 修改用户角色
 * @param {number} id - 用户ID
 * @param {number} role - 角色值 (1: 普通用户, 2: 管理员, 3: 超级管理员)
 * @returns {Promise}
 */
export function toggleUserRole(id, role) {
  return request.put('/admin/user/toggleRole', null, {
    params: { id, role }
  })
}

/**
 * 更新用户信息（角色、地址）
 * @param {Object} data - 用户信息
 * @param {number} data.id - 用户ID
 * @param {number} [data.role] - 角色值
 * @param {string} [data.address] - 默认地址
 * @returns {Promise}
 */
export function updateUserInfo(data) {
  return request.put('/admin/user/update', data)
}

