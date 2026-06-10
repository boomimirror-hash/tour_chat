import { tourFetch } from './fetch'
import type { TourApiResponse, TourSpotItem, AccommodationItem } from '@/types/api'

// contenttypeid: 12=관광지, 32=숙박
export async function searchSpots(params: {
  areaCode?: string
  keyword?: string
  numOfRows?: string
}): Promise<TourSpotItem[]> {
  const data = await tourFetch<TourApiResponse<TourSpotItem>>(
    'KorService1/searchKeyword1',
    {
      contenttypeid: '12',
      ...(params.areaCode && { areaCode: params.areaCode }),
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.numOfRows && { numOfRows: params.numOfRows }),
    }
  )

  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return []
  return Array.isArray(items.item) ? items.item : [items.item]
}

export async function searchAccommodations(params: {
  areaCode?: string
  numOfRows?: string
}): Promise<AccommodationItem[]> {
  const data = await tourFetch<TourApiResponse<AccommodationItem>>(
    'KorService1/searchKeyword1',
    {
      contenttypeid: '32',
      ...(params.areaCode && { areaCode: params.areaCode }),
      ...(params.numOfRows && { numOfRows: params.numOfRows }),
    }
  )

  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return []
  return Array.isArray(items.item) ? items.item : [items.item]
}

export async function getSpotDetail(contentId: string): Promise<TourSpotItem | null> {
  const data = await tourFetch<TourApiResponse<TourSpotItem>>(
    'KorService1/detailCommon1',
    { contentId, defaultYN: 'Y', firstImageYN: 'Y', addrinfoYN: 'Y', mapinfoYN: 'Y' }
  )

  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return null
  const list = Array.isArray(items.item) ? items.item : [items.item]
  return list[0] ?? null
}
