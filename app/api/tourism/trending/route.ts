import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getTrendingAreas } from '@/lib/tourism-api/bigdata'
import type { Database } from '@/lib/supabase/types'

type TrendingInsert = Database['public']['Tables']['trending_spots']['Insert']

// Vercel Cron 또는 수동 갱신 용도
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = authHeader?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const debug = request.headers.get('x-debug') === '1'
  if (debug) {
    const apiKey = process.env.BIGDATA_API_KEY ?? ''
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth() + 1
    const pm = m === 1 ? 12 : m - 1, py = m === 1 ? y - 1 : y
    const makeUrl = (year: number, month: number) => {
      const mm = String(month).padStart(2, '0')
      const last = new Date(year, month, 0).getDate()
      return `https://apis.data.go.kr/B551011/DataLabService/locgoRegnVisitrDDList?serviceKey=${apiKey}&MobileOS=ETC&MobileApp=TourismApp&_type=json&startYmd=${year}${mm}01&endYmd=${year}${mm}${last}&numOfRows=5`
    }
    const [r1, r2] = await Promise.all([
      fetch(makeUrl(y, m)).then(r => r.json()).catch(e => ({ error: String(e) })),
      fetch(makeUrl(py, pm)).then(r => r.json()).catch(e => ({ error: String(e) })),
    ])
    return NextResponse.json({ thisMonth: r1, prevMonth: r2 })
  }

  const areas = await getTrendingAreas(20)

  if (areas.length === 0) {
    console.error('[trending] 빅데이터 API 응답 없음 — 기존 데이터 유지')
    return NextResponse.json({ ok: false, message: 'No data from API' }, { status: 200 })
  }

  const supabase = await createServiceClient()

  // 기존 데이터 삭제 후 새 데이터 삽입 (upsert 대신 교체 방식)
  const { error: deleteError } = await supabase.from('trending_spots').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) {
    console.error('[trending] 삭제 실패:', deleteError.message)
    return NextResponse.json({ ok: false, message: deleteError.message }, { status: 500 })
  }

  const rows: TrendingInsert[] = areas.map((a) => ({
    area_code: a.areaCode,
    area_name: a.areaName,
    rank: a.rank,
    fetched_at: new Date().toISOString(),
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await supabase.from('trending_spots').insert(rows as any)

  if (insertError) {
    console.error('[trending] 삽입 실패:', insertError.message)
    return NextResponse.json({ ok: false, message: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, count: rows.length })
}
