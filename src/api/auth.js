/**
 * 认证相关 API
 */
import request from '@/utils/request'

/**
 * 用户登录
 * @param {string} account - 账号（用户名或手机号）
 * @param {string} password - 密码
 * @returns {Promise} 返回 token 和用户信息
 */
export function login(account, password) {
  return request.post('/admin/auth/login', null, {
    params: { account, password }
  })
}

/**
 * 用户注册
 * @param {Object} data - 用户信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.phone - 手机号
 * @returns {Promise}
 */
export function register(data) {
  return request.post('/admin/auth/register', data)
}

/**
 * 退出登录
 * @returns {Promise}
 */
export function logout() {
  return request.post('/admin/auth/logout')
}
