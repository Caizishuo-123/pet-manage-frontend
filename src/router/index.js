import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'pet',
        name: 'Pet',
        component: () => import('@/views/Pet.vue'),
        meta: { title: '宠物管理' }
      },
      {
        path: 'pet-service',
        name: 'PetService',
        component: () => import('@/views/PetService.vue'),
        meta: { title: '服务管理' }
      },
      {
        path: 'appointment',
        name: 'Appointment',
        component: () => import('@/views/Appointment.vue'),
        meta: { title: '预约管理' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'adoption',
        name: 'Adoption',
        component: () => import('@/views/Adoption.vue'),
        meta: { title: '领养管理' }
      },
      {
        path: 'community',
        name: 'Community',
        component: () => import('@/views/Community.vue'),
        meta: { title: '社区管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
