'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'

interface Message {
  role: 'user' | 'model'
  content: string
}

const FIRST_MESSAGE: Message = {
  role: 'model',
  content: '안녕하세요! 맞춤 여행 패키지를 만들어 드릴게요. 먼저 간단한 질문 몇 가지를 드릴게요 :)\n\n혼자 여행하시나요, 아니면 누구와 함께 가실 예정인가요?',
}

export function ChatWindow() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([FIRST_MESSAGE])
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text: string) {
    const userMsg: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setStreaming(true)

    // 스트리밍 응답 자리 확보
    setMessages((prev) => [...prev, { role: 'model', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!res.ok || !res.body) throw new Error('API error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })

        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'model', content: accumulated }
          return next
        })
      }

      // 취향 수집 완료 시 패키지 페이지로 이동
      if (accumulated.includes('[PREFERENCE_SAVED]')) {
        router.push('/packages')
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = {
          role: 'model',
          content: '죄송해요, 일시적인 오류가 발생했어요. 다시 시도해 주세요.',
        }
        return next
      })
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {streaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={streaming} />
    </div>
  )
}
