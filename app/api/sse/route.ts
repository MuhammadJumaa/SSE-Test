import { NextRequest } from "next/server"

interface SSEData {
  number: number
  timestamp: string
  type: 'random'
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function push() {
        const data: SSEData = {
          number: Math.random() * 100,
          timestamp: new Date().toISOString(),
          type: 'random'
        }
        
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch (error) {
          console.error('Error sending SSE data:', error)
          controller.error(error)
        }
      }

      // Send initial data
      push()

      const interval = setInterval(push, 1000)

      // If the client closes the connection, clean up
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })

      // Handle errors
      request.signal.addEventListener("error", (error) => {
        console.error('SSE connection error:', error)
        clearInterval(interval)
        controller.error(error)
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering for nginx
    },
  })
}

export const dynamic = "force-dynamic"
