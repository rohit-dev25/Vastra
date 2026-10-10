import React, { useContext, useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'

const ChatBot = () => {
  const { backendUrl } = useContext(ShopContext)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm the Vastra assistant. Ask me about products, sizing, or orders." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: 'user', text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(backendUrl + '/api/chat/message', {
        message: text,
        history: newMessages.slice(-8)
      })

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: "Sorry, something went wrong. Please try again." }])
      }
    } catch (error) {
      console.log(error)
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed bottom-5 right-5 z-50'>
      {open && (
        <div className='w-80 sm:w-96 h-[28rem] bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col mb-3'>
          <div className='bg-black text-white px-4 py-3 rounded-t-lg flex justify-between items-center'>
            <p className='font-medium'>Vastra Assistant</p>
            <button onClick={() => setOpen(false)} className='text-white text-lg leading-none'>×</button>
          </div>

          <div className='flex-1 overflow-y-auto p-3 flex flex-col gap-2 text-sm'>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-black text-white self-end rounded-br-none'
                    : 'bg-gray-100 text-gray-800 self-start rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className='bg-gray-100 text-gray-500 self-start px-3 py-2 rounded-lg rounded-bl-none text-sm'>
                Typing...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={sendMessage} className='flex border-t border-gray-200'>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Type a message...'
              className='flex-1 px-3 py-2 text-sm outline-none rounded-bl-lg'
            />
            <button type='submit' className='px-4 text-sm font-medium text-black'>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className='w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg text-2xl'
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}

export default ChatBot