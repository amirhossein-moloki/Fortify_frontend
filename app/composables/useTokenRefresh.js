import { ref } from 'vue'
import axios from 'axios'

export function useTokenRefresh() {
  const isRefreshing = ref(false)
  const error = ref(null)

  const refreshTokens = async () => {
    isRefreshing.value = true
    error.value = null

    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token found')
      }

      const response = await axios.post('http://localhost:8000/api/accounts/token/refresh-both/', {
        refresh_token: refreshToken
      })

      const { access_token, refresh_token } = response.data

      // Update the tokens in local storage
      localStorage.setItem('accessToken', access_token)
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token)
      }

      isRefreshing.value = false
      return { accessToken: access_token, refreshToken: refresh_token }
    } catch (err) {
      error.value = err.response?.data?.message || 'An error occurred while refreshing tokens'
      isRefreshing.value = false
      throw error.value
    }
  }

  return {
    isRefreshing,
    error,
    refreshTokens
  }
}

