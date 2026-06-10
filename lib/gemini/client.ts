import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `당신은 친근하고 따뜻한 여행 플래너입니다.
사용자와 짧은 대화를 통해 여행 취향 7가지를 자연스럽게 파악해야 합니다.

수집할 항목:
1. companion_type: 동행 유형 (solo/couple/family/friends)
2. nature_preference: 선호 자연환경 (mountain/sea/forest/rural 중 복수 선택)
3. activity_level: 활동 강도 (low/medium/high)
4. avoid_crowd: 혼잡한 곳 회피 여부 (true/false)
5. has_pet: 반려동물 동반 여부 (true/false)
6. prefer_wellness: 웰니스·힐링 선호 여부 (true/false)
7. prefer_camping: 캠핑·글램핑 관심 여부 (true/false)

규칙:
- 한 번에 한 가지 항목만 자연스럽게 질문하세요.
- 딱딱한 설문 형식이 아닌 일상 대화처럼 진행하세요.
- 7가지를 모두 파악하면 반드시 다음 형식으로 대화를 마무리하세요:

<preference_complete>
{
  "companion_type": "...",
  "nature_preference": [...],
  "activity_level": "...",
  "avoid_crowd": true/false,
  "has_pet": true/false,
  "prefer_wellness": true/false,
  "prefer_camping": true/false
}
</preference_complete>

마무리 멘트: "완벽해요! 맞춤 여행 패키지를 찾아볼게요 :)"
`

let genAI: GoogleGenerativeAI | null = null

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

// 스트리밍 응답 반환 (ReadableStream)
export async function streamChat(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  })

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }))

  const lastMessage = messages[messages.length - 1]
  const chat = model.startChat({ history })
  const result = await chat.sendMessageStream(lastMessage.content)

  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })
}

// 취향 JSON 파싱 (스트림 완료 후 전체 텍스트에서 추출)
export function parsePreference(fullText: string) {
  const match = fullText.match(/<preference_complete>([\s\S]*?)<\/preference_complete>/)
  if (!match) return null

  try {
    return JSON.parse(match[1].trim())
  } catch {
    return null
  }
}
