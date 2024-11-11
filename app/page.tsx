'use client'
import { useChat } from 'ai/react';
import { Reem_Kufi, Roboto } from "next/font/google";


export default function Chat() {
  const {messages, input, handleInputChange , handleSubmit} = useChat(
    {
      maxSteps: 3,
    }
  );
  return (
    <div className='flex flex-col w-full max-w-md py-24 mx-auto-stretch'>
      <div className ="space-y-4 flex-1 px-8"> 
        {messages.map(m=> (
          <div key={m.id} className="chat-message whitespace-pre-wrap">
            <div>
              <div className="font-bold font-Roboto">
                {m.role}
              </div>
            <p className=" font-Roboto">
            {m.content.length > 0 ? (
              m.content
            ) : (
              <span className="italic font-light">
                {'Calling tool: ' + m?.toolInvocations?.[0]?.toolName}
              </span>
            )}


            </p>
           </div>
          </div>
          
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-10 right-0 w-96 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
           value={input} 
         onChange={handleInputChange} 
         placeholder='Say Something...'  
         />
      </form>
    </div>


  )
}
