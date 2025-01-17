<template>
  <div>
    <button @click="handleRefresh" :disabled="isRefreshing">
      {{ isRefreshing ? 'Refreshing...' : 'Refresh Tokens' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { useTokenRefresh } from '../composables/useTokenRefresh'

const { isRefreshing, error, refreshTokens } = useTokenRefresh()

const handleRefresh = async () => {
  try {
    const { accessToken, refreshToken } = await refreshTokens()
    console.log('Tokens refreshed successfully')
    // You can do something with the new tokens here if needed
  } catch (err) {
    console.error('Failed to refresh tokens:', err)
  }
}
</script>

<style scoped>
.error {
  color: red;
}
</style>

