<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-icon">🎉</div>
        <h1>欢迎来到宠物服务管理平台</h1>
        <p>您已成功登录，{{ userStore.username }}</p>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="router.push('/dashboard')">
            进入仪表盘
          </el-button>
          <el-button size="large" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.welcome-card {
  width: 500px;
  border-radius: 16px;
  text-align: center;
}

.welcome-content {
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.welcome-content h1 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 12px 0;
}

.welcome-content p {
  font-size: 16px;
  color: #606266;
  margin: 0 0 30px 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
