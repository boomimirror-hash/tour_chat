export interface TourSpot {
  contentId: string
  title: string
  address: string
  imageUrl: string
  category: string
  mapX: number
  mapY: number
}

export interface Accommodation {
  contentId: string
  title: string
  type: 'hotel' | 'pension' | 'camping' | 'glamping'
  address: string
  imageUrl: string
  petFriendly: boolean
}

export interface RecommendedDate {
  date: string
  congestionScore: number
  label: '매우 여유' | '여유' | '보통'
}

export interface TourPackage {
  id: string
  spots: TourSpot[]
  accommodations: Accommodation[]
  recommendedDates: RecommendedDate[]
}
