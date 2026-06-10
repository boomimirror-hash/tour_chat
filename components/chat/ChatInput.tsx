'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    const value = ref.current?.value.trim()
    if (!value || disabled) return
    onSend(value)
    ref.current!.value = ''
    ref.current!.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleInput() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div className="flex items-end gap-2 border-t bg-background p-3">
      <textarea
        ref={ref}
        rows={1}
        placeholder="메시지를 입력하세요..."
        className="flex-1 resize-none rounded-xl border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
      />
      <Button size="sm" onClick={handleSubmit} disabled={disabled}>
        전송
      </Button>
    </div>
  )
}
