import { NextResponse, type NextRequest } from 'next/server'
import { streamChat, parsePreference, type ChatMessage } from '@/lib/gemini/client'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const { messages }: { messages: ChatMessage[] } = await request.json()

  if (!messages?.length) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 })
  }

  let fullText = ''
  const encoder = new TextEncoder()

  const geminiStream = await streamChat(messages).catch((e) => {
    console.error('[chat] streamChat error:', e?.message ?? e)
    return null
  })
  if (!geminiStream) {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = geminiStream.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullText += chunk
        controller.enqueue(encoder.encode(chunk))
      }

      // 취향 수집 완료 시 DB 저장 + 완료 이벤트 전송
      const preference = parsePreference(fullText)
      if (preference) {
        try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('preference_profiles') as any).insert({
              user_id: user.id,
              companion_type: preference.companion_type,
              nature_preference: preference.nature_preference,
              activity_level: preference.activity_level,
              avoid_crowd: preference.avoid_crowd,
              has_pet: preference.has_pet,
              prefer_wellness: preference.prefer_wellness,
              prefer_camping: preference.prefer_camping,
              raw_chat: messages,
            })
          }
        } catch (e) {
          console.error('[chat] preference 저장 실패:', e)
        }

        // 클라이언트에 완료 시그널 전송
        controller.enqueue(
          encoder.encode(`\n\n[PREFERENCE_SAVED]${JSON.stringify(preference)}`)
        )
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
