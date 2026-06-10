import { genericFetch } from './fetch'
import type { TourApiResponse, WellnessItem } from '@/types/api'

const BASE = 'https://apis.data.go.kr/B551011/KorWellnessTourService/getWellnessTourSpotsDetail'

export async function searchWellnessSpots(params: {
  areaCode?: string
  numOfRows?: string
}): Promise<WellnessItem[]> {
  const apiKey = process.env.WELLNESS_API_KEY
  if (!apiKey) return []

  const data = await genericFetch<TourApiResponse<WellnessItem>>(
    BASE,
    apiKey,
    {
      ...(params.areaCode && { areaCode: params.areaCode }),
      numOfRows: params.numOfRows ?? '20',
    }
  )

  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return []
  return Array.isArray(items.item) ? items.item : [items.item]
}
