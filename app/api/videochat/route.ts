import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

// Mock function to simulate video parsing
async function parseVideo(url: string) {
  // In a real application, this function would interact with a video processing service
  console.log('Parsing video:', url)
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time
  return `Video content: A tutorial about machine learning basics. 
  Topics covered: Neural networks, deep learning, and data preprocessing.
  Duration: 15 minutes`
}

export async function POST(req: Request) {
  const { messages, videoUrl } = await req.json()

  let videoContent = ''
  if (videoUrl && messages.length === 1) {
    videoContent = await parseVideo(videoUrl)
  }

  const latestMessage = messages[messages.length - 1].content

  const prompt = `
  You are a helpful AI assistant that can answer questions about video content.
  ${videoContent ? `Here's the content of the video: ${videoContent}` : ''}
  
  User's question: ${latestMessage}
  
  Please provide a helpful and informative response based on the video content and the user's question.
  If the question is not related to the video content, politely inform the user that you can only answer questions about the analyzed video.
  `

  const response = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: prompt,
  })

  return new Response(response.text)
}

