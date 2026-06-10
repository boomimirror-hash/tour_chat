const TOUR_BASE = 'https://apis.data.go.kr/B551011'
const CAMPING_BASE = 'https://apis.data.go.kr/B551011/GoCamping'

// 관광공사 API 공통 파라미터
function commonParams(apiKey: string) {
  return new URLSearchParams({
    serviceKey: apiKey,
    MobileOS: 'ETC',
    MobileApp: 'TourismApp',
    _type: 'json',
    numOfRows: '20',
    pageNo: '1',
  })
}

export async function tourFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const apiKey = process.env.TOURINFO_API_KEY
  if (!apiKey) return null

  const qs = commonParams(apiKey)
  Object.entries(params).forEach(([k, v]) => qs.set(k, v))

  try {
    const res = await fetch(`${TOUR_BASE}/${endpoint}?${qs}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

export async function campingFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const apiKey = process.env.CAMPING_API_KEY
  if (!apiKey) return null

  const qs = commonParams(apiKey)
  Object.entries(params).forEach(([k, v]) => qs.set(k, v))

  try {
    const res = await fetch(`${CAMPING_BASE}/${endpoint}?${qs}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

// 범용 API fetch (빅데이터·집중률·반려동물·웰니스·연관)
export async function genericFetch<T>(
  baseUrl: string,
  apiKey: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const qs = new URLSearchParams({
    serviceKey: apiKey,
    MobileOS: 'ETC',
    MobileApp: 'TourismApp',
    _type: 'json',
    ...params,
  })

  try {
    const res = await fetch(`${baseUrl}?${qs}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}
