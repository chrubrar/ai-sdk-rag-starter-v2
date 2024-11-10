'use client'
import { useChat } from 'ai/react';


export default function Chat() {
  const {messages, input, handleInputChange , handleSubmit} = useChat();
  return (
    <div className='flex flex-col w-full max-w-md py-24 mx-auto-stretch'>
      <div className ="space-y-4 flex-1 px-8"> 
        {messages.map(m=> (
          <div key={m.id} className="chat-message whitespace-pre-wrap">
            <div>
              <div className="font-bold">
                {m.role}
              </div>
            <p>{m.content}</p>
           </div>
          </div>
          
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-10 right-0 w-96 p-2 rounded-md border border-gray-300"
           value={input} 
         onChange={handleInputChange} 
         placeholder='Say Something...'  
         />
        <button type="submit">Send</button>
      </form>
    </div>


  )
}
