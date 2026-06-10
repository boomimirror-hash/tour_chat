import type { RecommendedDate } from '@/types/package'

interface CongestionCalendarProps {
  dates: RecommendedDate[]
}

const LABEL_STYLE: Record<string, { bar: string; text: string }> = {
  '매우 여유': { bar: 'bg-green-400', text: 'text-green-700' },
  '여유': { bar: 'bg-blue-400', text: 'text-blue-700' },
  '보통': { bar: 'bg-yellow-400', text: 'text-yellow-700' },
}

export function CongestionCalendar({ dates }: CongestionCalendarProps) {
  if (!dates.length) {
    return (
      <p className="text-sm text-muted-foreground">혼잡도 예측 데이터가 없습니다.</p>
    )
  }

  return (
    <div className="space-y-3">
      {dates.map((d) => {
        const style = LABEL_STYLE[d.label] ?? LABEL_STYLE['보통']
        return (
          <div key={d.date} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm font-medium">{d.date}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${style.bar}`}
                style={{ width: `${d.congestionScore}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${style.text} w-16 text-right`}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
