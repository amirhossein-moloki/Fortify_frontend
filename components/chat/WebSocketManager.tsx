import { useState, useEffect, useRef } from 'react'

interface WebSocketManagerProps {
  url: string
  onMessage: (data: any) => void
  onStatusChange: (status: 'connecting' | 'connected' | 'disconnected') => void
  onError: (error: string) => void
}

export function WebSocketManager({ url, onMessage, onStatusChange, onError }: WebSocketManagerProps) {
  const [retryCount, setRetryCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    onStatusChange('connecting')
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('WebSocket Connected')
      onStatusChange('connected')
      setRetryCount(0)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
        onError('Error parsing WebSocket message')
      }
    }

    ws.onerror = (event) => {
      console.error('WebSocket error:', event)
      onStatusChange('disconnected')
      onError('WebSocket encountered an error')
    }

    ws.onclose = (event) => {
      console.log(`WebSocket Disconnected. Code: ${event.code}, Reason: ${event.reason}`)
      onStatusChange('disconnected')
      wsRef.current = null

      // Exponential backoff for reconnection
      const timeout = Math.min(1000 * (2 ** retryCount), 30000)
      timeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        connect()
      }, timeout)
    }

    wsRef.current = ws
  }

  useEffect(() => {
    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [url])

  return null
}

