// 한국관광공사 API 공통 응답 래퍼
export interface TourApiResponse<T> {
  response: {
    header: { resultCode: string; resultMsg: string }
    body: {
      items: { item: T[] } | string
      numOfRows: number
      pageNo: number
      totalCount: number
    }
  }
}

// 관광지
export interface TourSpotItem {
  contentid: string
  contenttypeid: string
  title: string
  addr1: string
  addr2?: string
  firstimage?: string
  firstimage2?: string
  mapx: string
  mapy: string
  areacode: string
  sigungucode?: string
  cat1?: string
  cat2?: string
  cat3?: string
  readcount?: number
  modifiedtime?: string
}

// 숙박
export interface AccommodationItem {
  contentid: string
  contenttypeid: string
  title: string
  addr1: string
  firstimage?: string
  mapx: string
  mapy: string
  areacode: string
  benikia?: string
  goodstay?: string
  hanok?: string
  checkintime?: string
  checkouttime?: string
  reservationurl?: string
}

// 캠핑 (고캠핑 API)
export interface CampingItem {
  contentId: string
  facltNm: string
  addr1: string
  addr2?: string
  firstImageUrl?: string
  mapX: string
  mapY: string
  doNm: string
  sigunguNm: string
  induty: string        // 일반야영장, 자동차야영장, 글램핑, 카라반
  sbrsCl?: string       // 부대시설
  animalCmgCl?: string  // 반려동물 입장
  homepage?: string
  resveCl?: string      // 예약구분
}

// 관광 빅데이터 급상승 지역
export interface TrendingAreaItem {
  areaCode: string
  areaName: string
  rank: number
  visitCount?: number
  increaseRate?: number
}

// 관광지 집중률 예측
export interface CongestionItem {
  contentId: string
  date: string          // YYYYMMDD
  congestionLevel: number  // 0~100
  dayOfWeek?: string
}

// 반려동물 동반여행
export interface PetFacilityItem {
  contentId: string
  contentTypeId: string
  title: string
  addr1: string
  firstimage?: string
  mapX: string
  mapY: string
  petAcmpyPosblCl?: string  // 반려동물 동반 가능 구분
}

// 웰니스 관광
export interface WellnessItem {
  contentId: string
  title: string
  addr1: string
  firstimage?: string
  mapX: string
  mapY: string
  areaCode: string
  wellnessType?: string
}

// 연관 관광지
export interface SimilarSpotItem {
  contentId: string
  title: string
  addr1: string
  firstimage?: string
  mapX: string
  mapY: string
  contenttypeid: string
}
