'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function VideoChatbot() {
  const [videoUrl, setVideoUrl] = useState('')
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/videochat',
    body: { videoUrl },
  })

  const handleVideoUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // You might want to add validation for the video URL here
    console.log('Video URL submitted:', videoUrl)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Video Parsing Chatbot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVideoUrlSubmit} className="mb-4">
            <div className="flex items-center space-x-2">
              <Input
                type="url"
                placeholder="Enter video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit">Analyze Video</Button>
            </div>
          </form>
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-2 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about the video..."
              className="flex-grow"
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

