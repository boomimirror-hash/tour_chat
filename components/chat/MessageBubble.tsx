interface MessageBubbleProps {
  role: 'user' | 'model'
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user'

  // preference_complete 태그 및 PREFERENCE_SAVED 시그널 숨김
  const visible = content
    .replace(/<preference_complete>[\s\S]*?<\/preference_complete>/g, '')
    .replace(/\[PREFERENCE_SAVED\].*/g, '')
    .trim()

  if (!visible) return null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        {visible}
      </div>
    </div>
  )
}
