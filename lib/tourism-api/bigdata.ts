import { genericFetch } from './fetch'
import type { TourApiResponse, TrendingAreaItem } from '@/types/api'

const BASE = 'https://apis.data.go.kr/B551011/DataLabService/locgoRegnVisitrDDList'

function monthRange(year: number, month: number) {
  const y = year.toString()
  const m = String(month).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  return { startYmd: `${y}${m}01`, endYmd: `${y}${m}${lastDay}` }
}

async function fetchForMonth(apiKey: string, year: number, month: number, limit: number) {
  const data = await genericFetch<TourApiResponse<TrendingAreaItem>>(BASE, apiKey, {
    ...monthRange(year, month),
    numOfRows: String(limit),
  })
  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return []
  const list = Array.isArray(items.item) ? items.item : [items.item]
  return list.map((item, i) => ({ ...item, rank: item.rank ?? i + 1 }))
}

export async function getTrendingAreas(limit = 20): Promise<TrendingAreaItem[]> {
  const apiKey = process.env.BIGDATA_API_KEY
  if (!apiKey) return []

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // 빅데이터 API는 1~2달 지연이 있으므로 이달 → 전달 순으로 시도
  const current = await fetchForMonth(apiKey, year, month, limit)
  if (current.length > 0) return current

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  return fetchForMonth(apiKey, prevYear, prevMonth, limit)
}
