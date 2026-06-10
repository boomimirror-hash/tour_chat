import { genericFetch } from './fetch'
import type { TrendingAreaItem } from '@/types/api'

const BASE = 'https://apis.data.go.kr/B551011/DataLabService/locgoRegnVisitrDDList'

// signguCode 앞 2자리 → TourAPI areaCode 매핑
const SIGUNGU_TO_AREA: Record<string, { code: string; name: string }> = {
  '11': { code: '1',  name: '서울' },
  '26': { code: '6',  name: '부산' },
  '27': { code: '4',  name: '대구' },
  '28': { code: '2',  name: '인천' },
  '29': { code: '5',  name: '광주' },
  '30': { code: '3',  name: '대전' },
  '31': { code: '7',  name: '울산' },
  '36': { code: '8',  name: '세종' },
  '41': { code: '31', name: '경기' },
  '42': { code: '32', name: '강원' },
  '43': { code: '33', name: '충북' },
  '44': { code: '34', name: '충남' },
  '45': { code: '37', name: '전북' },
  '46': { code: '38', name: '전남' },
  '47': { code: '35', name: '경북' },
  '48': { code: '36', name: '경남' },
  '50': { code: '39', name: '제주' },
}

interface RawVisitorItem {
  signguCode: string
  signguNm: string
  touDivCd: string   // '1'=현지인, '2'=외지인, '3'=외국인
  touNum: string
  baseYmd: string
}

interface RawResponse {
  response: {
    header: { resultCode: string; resultMsg: string }
    body: {
      items: { item: RawVisitorItem[] } | string
      totalCount: number
    }
  }
}

function monthRange(year: number, month: number) {
  const y = year.toString()
  const m = String(month).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  return { startYmd: `${y}${m}01`, endYmd: `${y}${m}${lastDay}` }
}

async function fetchForMonth(
  apiKey: string,
  year: number,
  month: number,
): Promise<TrendingAreaItem[]> {
  const data = await genericFetch<RawResponse>(BASE, apiKey, {
    ...monthRange(year, month),
    numOfRows: '500',
  })

  const items = data?.response?.body?.items
  if (!items || typeof items === 'string') return []
  const list = Array.isArray(items.item) ? items.item : [items.item]

  // 외지인(2) + 외국인(3) 방문자 수를 광역시도별로 합산
  const totals = new Map<string, { name: string; sum: number }>()
  for (const row of list) {
    if (row.touDivCd !== '2' && row.touDivCd !== '3') continue
    const prefix = row.signguCode.slice(0, 2)
    const area = SIGUNGU_TO_AREA[prefix]
    if (!area) continue
    const prev = totals.get(area.code) ?? { name: area.name, sum: 0 }
    totals.set(area.code, { name: area.name, sum: prev.sum + parseFloat(row.touNum || '0') })
  }

  if (totals.size === 0) return []

  return Array.from(totals.entries())
    .sort((a, b) => b[1].sum - a[1].sum)
    .map(([code, { name, sum }], i) => ({
      areaCode: code,
      areaName: name,
      rank: i + 1,
      visitCount: Math.round(sum),
    }))
}

export async function getTrendingAreas(limit = 20): Promise<TrendingAreaItem[]> {
  const apiKey = process.env.BIGDATA_API_KEY
  if (!apiKey) return []

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // 빅데이터 API는 1~2달 지연 → 이달 데이터 없으면 전달로 fallback
  const current = await fetchForMonth(apiKey, year, month)
  if (current.length > 0) return current.slice(0, limit)

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prev = await fetchForMonth(apiKey, prevYear, prevMonth)
  return prev.slice(0, limit)
}
