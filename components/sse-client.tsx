"use client"

import { useState, useEffect, useCallback } from "react"

export default function SSEClient() {
  const [number, setNumber] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)

  const connectSSE = useCallback(() => {
    if (!isEnabled) return

    const eventSource = new EventSource("/api/sse")
    
    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setNumber(data.number)
        setError(null)
      } catch (err) {
        setError("Failed to parse data from server")
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      setIsConnected(false)
      setError("Connection lost. Attempting to reconnect...")
      eventSource.close()
      setTimeout(connectSSE, 5000) // Try to reconnect after 5 seconds
    }

    return eventSource
  }, [isEnabled])

  useEffect(() => {
    let eventSource: EventSource | null = null

    if (isEnabled) {
      eventSource = connectSSE()
    }

    return () => {
      if (eventSource) {
        eventSource.close()
        setIsConnected(false)
      }
    }
  }, [isEnabled, connectSSE])

  const toggleConnection = () => {
    setIsEnabled(!isEnabled)
    if (isEnabled) {
      setNumber(null)
      setIsConnected(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">SSE Random Number</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <button
          onClick={toggleConnection}
          className={`px-4 py-2 rounded-md ${
            isEnabled
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
        >
          {isEnabled ? 'Stop' : 'Start'} Connection
        </button>
      </div>

      {error ? (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {error}
        </div>
      ) : (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-4xl font-mono text-center">
            {number !== null ? number.toFixed(2) : "Waiting for data..."}
          </p>
        </div>
      )}
    </div>
  )
}
