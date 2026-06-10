import { campingFetch } from './fetch'
import type { TourApiResponse, CampingItem } from '@/types/api'

export async function searchCamping(params: {
  doNm?: string      // 도 이름
  sigunguNm?: string
  keyword?: string
  numOfRows?: string
}): Promise<CampingItem[]> {
  const data = await campingFetch<TourApiResponse<CampingItem>>(
    'basedList',
    {
      ...(params.doNm && { doNm: params.doNm }),
      ...(params.sigunguNm && { sigunguNm: params.sigunguNm }),
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.numOfRows && { numOfRows: params.numOfRows }),
    }
  )

  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return []
  return Array.isArray(items.item) ? items.item : [items.item]
}

export async function searchGlamping(params: {
  doNm?: string
  numOfRows?: string
}): Promise<CampingItem[]> {
  const all = await searchCamping({ ...params, numOfRows: params.numOfRows ?? '20' })
  return all.filter((c) => c.induty?.includes('글램핑'))
}

// 반려동물 동반 가능 캠핑장 필터
export async function searchPetCamping(params: { doNm?: string }): Promise<CampingItem[]> {
  const all = await searchCamping({ ...params, numOfRows: '50' })
  return all.filter((c) => c.animalCmgCl && c.animalCmgCl !== '불가')
}
