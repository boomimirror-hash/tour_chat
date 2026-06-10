import { searchSpots, searchAccommodations } from './tourism-api/tour'
import { searchPetCamping, searchCamping, searchGlamping } from './tourism-api/camping'
import { getLowCongestionDates } from './tourism-api/congestion'
import { searchPetFriendlySpots } from './tourism-api/pet'
import { searchWellnessSpots } from './tourism-api/wellness'
import type { TourSpot, Accommodation, RecommendedDate, TourPackage } from '@/types/package'
import type { TrendingAreaItem } from '@/types/api'

interface PreferenceProfile {
  companion_type: string
  nature_preference: string[]
  activity_level: string
  avoid_crowd: boolean
  has_pet: boolean
  prefer_wellness: boolean
  prefer_camping: boolean
}

// 관광공사 지역코드 → 도 이름 매핑 (고캠핑 API 호환)
const AREA_TO_DO: Record<string, string> = {
  '1': '서울특별시',
  '2': '인천광역시',
  '3': '대전광역시',
  '4': '대구광역시',
  '5': '광주광역시',
  '6': '부산광역시',
  '7': '울산광역시',
  '8': '세종특별자치시',
  '31': '경기도',
  '32': '강원특별자치도',
  '33': '충청북도',
  '34': '충청남도',
  '35': '경상북도',
  '36': '경상남도',
  '37': '전라북도',
  '38': '전라남도',
  '39': '제주특별자치도',
}

function mapToTourSpot(item: {
  contentid?: string
  contentId?: string
  title: string
  addr1?: string
  firstimage?: string
  firstImageUrl?: string
  mapx?: string
  mapX?: string
  mapy?: string
  mapY?: string
  cat1?: string
}): TourSpot {
  return {
    contentId: item.contentid ?? item.contentId ?? '',
    title: item.title,
    address: item.addr1 ?? '',
    imageUrl: item.firstimage ?? item.firstImageUrl ?? '',
    category: item.cat1 ?? '',
    mapX: parseFloat(item.mapx ?? item.mapX ?? '0'),
    mapY: parseFloat(item.mapy ?? item.mapY ?? '0'),
  }
}

function mapToAccommodation(
  item: {
    contentid?: string
    contentId?: string
    title: string
    addr1?: string
    firstimage?: string
    firstImageUrl?: string
    mapx?: string
    mapX?: string
    mapy?: string
    mapY?: string
    animalCmgCl?: string
    induty?: string
  },
  petFriendly = false
): Accommodation {
  const induty = item.induty ?? ''
  const type: Accommodation['type'] = induty.includes('글램핑')
    ? 'glamping'
    : induty.includes('야영') || induty.includes('카라반')
      ? 'camping'
      : 'hotel'

  return {
    contentId: item.contentid ?? item.contentId ?? '',
    title: item.title,
    type,
    address: item.addr1 ?? '',
    imageUrl: item.firstimage ?? item.firstImageUrl ?? '',
    petFriendly: petFriendly || (item.animalCmgCl !== undefined && item.animalCmgCl !== '불가'),
  }
}

export async function buildPackages(
  preference: PreferenceProfile,
  trendingAreas: TrendingAreaItem[]
): Promise<TourPackage[]> {
  // 상위 5개 트렌드 지역 선택
  const targetAreas = trendingAreas.slice(0, 5)

  const packages = await Promise.allSettled(
    targetAreas.map((area) => buildOnePackage(preference, area))
  )

  return packages
    .filter((r): r is PromiseFulfilledResult<TourPackage> => r.status === 'fulfilled' && r.value.spots.length > 0)
    .map((r) => r.value)
    .slice(0, 5)
}

async function buildOnePackage(
  preference: PreferenceProfile,
  area: TrendingAreaItem
): Promise<TourPackage> {
  const areaCode = area.areaCode
  const doNm = AREA_TO_DO[areaCode]

  // 관광지·숙박·혼잡도를 병렬 조회
  const [spotsResult, accommodationsResult, congestionResult] = await Promise.allSettled([
    fetchSpots(preference, areaCode, doNm),
    fetchAccommodations(preference, areaCode, doNm),
    fetchDates(preference, areaCode),
  ])

  const spots = spotsResult.status === 'fulfilled' ? spotsResult.value : []
  const accommodations = accommodationsResult.status === 'fulfilled' ? accommodationsResult.value : []
  const recommendedDates = congestionResult.status === 'fulfilled' ? congestionResult.value : []

  return {
    id: crypto.randomUUID(),
    spots,
    accommodations,
    recommendedDates,
  }
}

async function fetchSpots(
  preference: PreferenceProfile,
  areaCode: string,
  doNm: string | undefined
): Promise<TourSpot[]> {
  const results = await Promise.allSettled([
    // 웰니스 선호 시 웰니스 관광지 포함
    preference.prefer_wellness
      ? searchWellnessSpots({ areaCode, numOfRows: '5' })
      : Promise.resolve([]),
    // 반려동물 동반 시 반려동물 가능 시설 포함
    preference.has_pet
      ? searchPetFriendlySpots({ areaCode, numOfRows: '5' })
      : Promise.resolve([]),
    // 기본 관광지
    searchSpots({ areaCode, numOfRows: '5' }),
  ])

  const wellnessSpots = results[0].status === 'fulfilled' ? results[0].value : []
  const petSpots = results[1].status === 'fulfilled' ? results[1].value : []
  const baseSpots = results[2].status === 'fulfilled' ? results[2].value : []

  // 중복 제거 후 최대 5개
  const seen = new Set<string>()
  const merged: TourSpot[] = []

  for (const item of [...wellnessSpots, ...petSpots, ...baseSpots]) {
    const id = (item as { contentId?: string; contentid?: string }).contentId
      ?? (item as { contentid?: string }).contentid
      ?? ''
    if (!seen.has(id)) {
      seen.add(id)
      merged.push(mapToTourSpot(item as Parameters<typeof mapToTourSpot>[0]))
    }
    if (merged.length >= 5) break
  }

  return merged
}

async function fetchAccommodations(
  preference: PreferenceProfile,
  areaCode: string,
  doNm: string | undefined
): Promise<Accommodation[]> {
  const results = await Promise.allSettled([
    // 캠핑·글램핑 선호
    preference.prefer_camping && doNm
      ? preference.has_pet
        ? searchPetCamping({ doNm })
        : searchGlamping({ doNm, numOfRows: '5' })
      : Promise.resolve([]),
    // 일반 숙박
    searchAccommodations({ areaCode, numOfRows: '5' }),
  ])

  const campingItems = results[0].status === 'fulfilled' ? results[0].value : []
  const hotelItems = results[1].status === 'fulfilled' ? results[1].value : []

  const seen = new Set<string>()
  const merged: Accommodation[] = []

  for (const item of campingItems) {
    const id = item.contentId ?? ''
    if (!seen.has(id)) {
      seen.add(id)
      merged.push(
        mapToAccommodation(
          { ...item, contentid: item.contentId, title: item.facltNm },
          preference.has_pet
        )
      )
    }
    if (merged.length >= 3) break
  }

  for (const item of hotelItems) {
    const id = item.contentid ?? ''
    if (!seen.has(id)) {
      seen.add(id)
      merged.push(mapToAccommodation(item))
    }
    if (merged.length >= 5) break
  }

  return merged
}

async function fetchDates(
  preference: PreferenceProfile,
  areaCode: string
): Promise<RecommendedDate[]> {
  // 혼잡 회피 선호가 없으면 날짜만 빈 배열 반환해도 무방
  if (!preference.avoid_crowd) return []

  // 대표 관광지 contentId 없이도 areaCode로 조회 가능한 경우 대비 — 일단 빈 배열
  // 실제 집중률 예측 API는 contentId 필수이므로 관광지 조회 후 첫 번째 contentId 활용
  const spots = await searchSpots({ areaCode, numOfRows: '1' })
  if (!spots.length) return []

  const dates = await getLowCongestionDates(spots[0].contentid ?? '', 3)
  return dates.map((d) => ({
    date: d.date,
    congestionScore: d.congestionLevel,
    label: d.label,
  }))
}
