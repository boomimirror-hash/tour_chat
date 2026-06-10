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
