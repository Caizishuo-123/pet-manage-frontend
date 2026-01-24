import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  // ============ State ============
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  // ============ Getters ============
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const isAdmin = computed(() => userInfo.value?.role === 2 || userInfo.value?.role === 3)  // role=2或3 表示管理员

  // ============ Actions ============

  /**
   * 用户登录
   * @param {string} account - 账号（用户名或手机号）
   * @param {string} password - 密码
   */
  async function login(account, password) {
    const res = await authApi.login(account, password)

    if (res.code === 200) {
      const data = res.data

      // 检查是否为管理员 (role=2或3)
      if (data.role !== 2 && data.role !== 3) {
        throw new Error('非管理员用户无法登录管理后台')
      }

      // 保存 token 和用户信息
      token.value = data.token
      userInfo.value = {
        userId: data.userId,
        username: data.username,
        phone: data.phone,
        role: data.role
      }

      // 持久化到 localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

      return res
    } else {
      throw new Error(res.msg || '登录失败')
    }
  }

  /**
   * 用户退出登录
   */
  async function logout() {
    try {
      await authApi.logout()
    } catch (e) {
      console.warn('退出登录请求失败', e)
    } finally {
      // 清除状态
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')

      // 跳转到登录页
      router.push('/login')
    }
  }

  return {
    // State
    token,
    userInfo,
    // Getters
    isLoggedIn,
    username,
    isAdmin,
    // Actions
    login,
    logout
  }
})
