/**
 * API 统一导出
 * 
 * 使用示例:
 * import { authApi, userApi } from '@/api'
 * 
 * authApi.login('admin', '123456')
 * userApi.getUserPage({ page: 1, pageSize: 10 })
 */

import * as authApi from './auth'
import * as userApi from './user'
import * as petApi from './pet'

export {
  authApi,
  userApi,
  petApi
}
