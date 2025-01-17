'use client'

import { useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface TokenRefreshProps {
  children: React.ReactNode
}

export default function TokenRefresh({ children }: TokenRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    const refreshToken = async () => {
      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (!storedRefreshToken) {
        router.push('/login')
        return
      }

      try {
        const response = await axios.post('/api/refresh-token', {
          refresh_token: storedRefreshToken
        })

        // Update the access token
        localStorage.setItem('accessToken', response.data.access_token)

        // If a new refresh token is provided, update it
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token)
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        // Redirect to login page on failure
        router.push('/login')
      }
    }

    // Call the refresh function
    refreshToken()

    // Set up an interval to refresh the token periodically
    const refreshInterval = setInterval(refreshToken, 55 * 60 * 1000) // Refresh every 55 minutes

    // Clean up the interval on component unmount
    return () => clearInterval(refreshInterval)
  }, [router])

  return <>{children}</>
}

