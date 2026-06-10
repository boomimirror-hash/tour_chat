import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildPackages } from '@/lib/package-builder'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { preferenceId } = await request.json()
  if (!preferenceId) return NextResponse.json({ error: 'preferenceId required' }, { status: 400 })

  // 취향 프로필 조회
  const { data: preference } = await supabase
    .from('preference_profiles')
    .select('*')
    .eq('id', preferenceId)
    .eq('user_id', user.id)
    .single()

  if (!preference) return NextResponse.json({ error: 'Preference not found' }, { status: 404 })

  // 트렌드 지역 조회 (캐싱 데이터)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: trendingRaw } = await (supabase.from('trending_spots') as any)
    .select('*')
    .order('rank', { ascending: true })
    .limit(20)

  const trendingAreas = ((trendingRaw ?? []) as { area_code: string; area_name: string; rank: number }[]).map((r) => ({
    areaCode: r.area_code,
    areaName: r.area_name,
    rank: r.rank,
  }))

  // 트렌드 데이터 없으면 주요 지역 fallback
  const areas = trendingAreas.length > 0
    ? trendingAreas
    : [
        { areaCode: '6', areaName: '부산', rank: 1 },
        { areaCode: '39', areaName: '제주', rank: 2 },
        { areaCode: '32', areaName: '강원', rank: 3 },
        { areaCode: '38', areaName: '전남', rank: 4 },
        { areaCode: '35', areaName: '경북', rank: 5 },
      ]

  const packages = await buildPackages(preference, areas)

  // DB 저장
  if (packages.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('packages') as any).insert(
      packages.map((pkg) => ({
        id: pkg.id,
        user_id: user.id,
        preference_id: preferenceId,
        spots: pkg.spots,
        accommodations: pkg.accommodations,
        recommended_dates: pkg.recommendedDates,
      }))
    )
  }

  return NextResponse.json({ packages })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('packages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ packages: data ?? [] })
}
