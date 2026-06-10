import { genericFetch } from './fetch'
import type { TourApiResponse, SimilarSpotItem } from '@/types/api'

const BASE = 'https://apis.data.go.kr/B551011/KorService1/detailWithSimilarContents1'

export async function getSimilarSpots(contentId: string): Promise<SimilarSpotItem[]> {
  const apiKey = process.env.SIMILAR_API_KEY
  if (!apiKey) return []

  const data = await genericFetch<TourApiResponse<SimilarSpotItem>>(
    BASE,
    apiKey,
    { contentId, numOfRows: '6' }
  )

  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return []
  return Array.isArray(items.item) ? items.item : [items.item]
}
