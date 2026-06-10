import { genericFetch } from './fetch'
import type { TourApiResponse, CongestionItem } from '@/types/api'

const BASE = 'https://apis.data.go.kr/B551011/TourismCongestionForecastService/tourismCongestionForecastList'

export async function getCongestionForecast(contentId: string): Promise<CongestionItem[]> {
  const apiKey = process.env.CONGESTION_API_KEY
  if (!apiKey) return []

  const data = await genericFetch<TourApiResponse<CongestionItem>>(
    BASE,
    apiKey,
    { contentId, numOfRows: '30' }
  )

  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return []
  return Array.isArray(items.item) ? items.item : [items.item]
}

// 향후 30일 중 혼잡도 낮은 날짜 top N 반환
export async function getLowCongestionDates(
  contentId: string,
  topN = 3
): Promise<{ date: string; congestionLevel: number; label: '매우 여유' | '여유' | '보통' }[]> {
  const forecasts = await getCongestionForecast(contentId)
  if (forecasts.length === 0) return []

  const today = new Date()
  const future = forecasts
    .filter((f) => {
      const d = new Date(
        `${f.date.slice(0, 4)}-${f.date.slice(4, 6)}-${f.date.slice(6, 8)}`
      )
      return d > today
    })
    .sort((a, b) => a.congestionLevel - b.congestionLevel)
    .slice(0, topN)

  return future.map((f) => ({
    date: `${f.date.slice(0, 4)}-${f.date.slice(4, 6)}-${f.date.slice(6, 8)}`,
    congestionLevel: f.congestionLevel,
    label:
      f.congestionLevel <= 30
        ? '매우 여유'
        : f.congestionLevel <= 60
          ? '여유'
          : '보통',
  }))
}
