'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Send, Bot, User, Sparkles, ShoppingBag, Tag, Truck } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

const quickReplies = [
  'Track my order',
  'Return policy',
  'Available coupons',
  'Flash sale deals',
]

const aiResponses: Record<string, string> = {
  'track my order': "I can help you track your order! 📦 Your most recent order #SZ20240315001 is currently **Shipped** and expected to be delivered by March 20, 2024. You can track it in real-time from your Orders section.",
  'return policy': "Our return policy is simple and customer-friendly! 🔄\n\n• **7-15 days** return window for most items\n• **Free pickup** from your doorstep\n• **Instant refund** to your wallet or original payment method\n• Some items like groceries and innerwear are non-returnable\n\nWould you like to initiate a return?",
  'available coupons': "Here are the best coupons available right now! 🎉\n\n• **WELCOME100** - ₹100 off on first order\n• **SAVE20** - 20% off on orders above ₹999\n• **FLASH50** - 50% off up to ₹1000 on flash sale\n• **FASHION30** - 30% off on fashion items\n\nCopy any code and apply at checkout!",
  'flash sale deals': "🔥 Flash Sale is LIVE right now! Here are the hottest deals:\n\n• TWS Earbuds Pro Max - **70% off** at ₹1,499\n• Smart Watch Ultra - **70% off** at ₹2,999\n• 4K Action Camera - **62% off** at ₹4,999\n• Robot Vacuum Cleaner - **51% off** at ₹16,999\n\n⏰ Sale ends in 4 hours! Grab them before they're gone!",
  'default': "Thanks for your message! 👋 I'm ShopZone AI Assistant, here to help you with:\n\n• 📦 Order tracking & status\n• 🔄 Returns & refunds\n• 🏷️ Coupons & offers\n• 💡 Product recommendations\n• ❓ Any other queries\n\nHow can I assist you today?",
}

function getAIResponse(message: string): { content: string; suggestions?: string[] } {
  const lower = message.toLowerCase()
  for (const [key, value] of Object.entries(aiResponses)) {
    if (key !== 'default' && lower.includes(key)) {
      return { content: value, suggestions: ['View all coupons', 'Check order status', 'Browse deals'] }
    }
  }
  if (lower.includes('coupon') || lower.includes('offer') || lower.includes('discount')) {
    return { content: aiResponses['available coupons'], suggestions: ['Apply coupon', 'Flash sale deals'] }
  }
  if (lower.includes('order') || lower.includes('deliver') || lower.includes('ship')) {
    return { content: aiResponses['track my order'], suggestions: ['Return policy', 'Cancel order'] }
  }
  if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
    return { content: aiResponses['return policy'], suggestions: ['Track order', 'Contact support'] }
  }
  if (lower.includes('flash') || lower.includes('sale') || lower.includes('deal')) {
    return { content: aiResponses['flash sale deals'], suggestions: ['View all deals', 'Available coupons'] }
  }
  return { content: aiResponses['default'], suggestions: ['Track my order', 'Return policy', 'Available coupons', 'Flash sale deals'] }
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi there! 👋 I'm your ShopZone AI Assistant. I can help you with orders, returns, coupons, product recommendations, and more. What would you like to know?",
      timestamp: new Date(),
      suggestions: ['Track my order', 'Available coupons', 'Flash sale deals', 'Return policy'],
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = getAIResponse(text)
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-orange-500/40 transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[550px] max-h-[calc(100vh-100px)] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">ShopZone AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    )}
                  </div>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-orange-500 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm shadow-sm border border-zinc-100 dark:border-zinc-700'
                    }`}>
                      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                        __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    </div>
                    {msg.suggestions && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="px-3 py-1 text-xs bg-white dark:bg-zinc-800 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-50 dark:hover:bg-zinc-700 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-zinc-100 dark:border-zinc-700">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto shrink-0 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  onClick={() => sendMessage(qr)}
                  className="px-3 py-1 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors whitespace-nowrap shrink-0"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-700 flex gap-2 shrink-0 bg-white dark:bg-zinc-900">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Type your message..."
                className="flex-1 text-sm rounded-full border-zinc-200 dark:border-zinc-700 focus-visible:ring-orange-500"
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white w-9 h-9"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
