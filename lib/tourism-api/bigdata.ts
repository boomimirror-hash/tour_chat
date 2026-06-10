import { genericFetch } from './fetch'
import type { TourApiResponse, TrendingAreaItem } from '@/types/api'

const BASE = 'https://apis.data.go.kr/B551011/DataLabService/locgoRegnVisitrDDList'

export async function getTrendingAreas(limit = 20): Promise<TrendingAreaItem[]> {
  const apiKey = process.env.BIGDATA_API_KEY
  if (!apiKey) return []

  const now = new Date()
  const year = now.getFullYear().toString()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  const data = await genericFetch<TourApiResponse<TrendingAreaItem>>(
    BASE,
    apiKey,
    {
      startYmd: `${year}${month}01`,
      endYmd: `${year}${month}${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`,
      numOfRows: String(limit),
    }
  )

  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return []
  const list = Array.isArray(items.item) ? items.item : [items.item]

  // rank 필드가 없으면 순서 기반으로 부여
  return list.map((item, i) => ({ ...item, rank: item.rank ?? i + 1 }))
}
