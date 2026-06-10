import { genericFetch } from './fetch'
import type { TourApiResponse, PetFacilityItem } from '@/types/api'

const BASE = 'https://apis.data.go.kr/B551011/KorPetTourService/petTourSpotsDetailList'

export async function searchPetFriendlySpots(params: {
  areaCode?: string
  numOfRows?: string
}): Promise<PetFacilityItem[]> {
  const apiKey = process.env.PET_API_KEY
  if (!apiKey) return []

  const data = await genericFetch<TourApiResponse<PetFacilityItem>>(
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
