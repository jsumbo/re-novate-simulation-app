"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Users, Target, LogOut, Loader2 } from "lucide-react"
import { logout } from "@/lib/auth/actions"
import Link from "next/link"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIMentorChatProps {
  user: any
}

export function AIMentorChat({ user }: AIMentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${user.username || user.participant_id}! 👋 I'm Noni, your AI mentor here at RE-Novate. I'm here to help you with your entrepreneurship journey, answer questions about business concepts, provide guidance on your simulations, or just chat about your goals and aspirations. What would you like to talk about today?`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/mentor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          userId: user.id,
          username: user.username || user.participant_id,
          careerPath: user.career_path,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from Noni')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! 😊",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold">RE-Novate</h2>
          <p className="text-gray-400 text-sm">{user.username || user.participant_id}</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white">
            <Target className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/student/profile" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white">
            <Users className="h-4 w-4" />
            Profile
          </Link>
          <Link href="/student/community" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white">
            <Users className="h-4 w-4" />
            Community
          </Link>
          <a href="/student/mentor" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-black font-medium">
            <div className="h-4 w-4 text-center">🤖</div>
            Noni AI Mentor
          </a>
        </nav>
        
        <form action={logout} className="mt-auto">
          <button className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white w-full text-left">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <Link href="/student/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                🤖
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Noni AI Mentor</h1>
                <p className="text-gray-600 text-sm">Your friendly entrepreneurship guide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-black border border-gray-200 rounded-lg p-4 max-w-[70%]">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Noni is thinking...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Noni anything about entrepreneurship, business, or your learning journey..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Try asking: "How do I improve my leadership skills?" or "What should I focus on in my next simulation?"
          </p>
        </div>
      </div>
    </div>
  )
}