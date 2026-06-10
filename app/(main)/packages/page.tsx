import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PackageCard } from '@/components/package/PackageCard'
import { buttonVariants } from '@/components/ui/button'
import { buildPackages } from '@/lib/package-builder'
import { cn } from '@/lib/utils'
import type { TourPackage } from '@/types/package'

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 최신 취향 프로필
  const { data: preference } = await supabase
    .from('preference_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!preference) redirect('/chat')

  // 기존 생성 패키지 조회 (당일 생성된 것)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingRaw } = await (supabase.from('packages') as any)
    .select('*')
    .eq('user_id', user.id)
    .eq('preference_id', (preference as { id: string }).id)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  const existing = existingRaw as {
    id: string
    spots: TourPackage['spots']
    accommodations: TourPackage['accommodations']
    recommended_dates: TourPackage['recommendedDates']
  }[] | null

  let packages: TourPackage[] = []

  if (existing && existing.length > 0) {
    packages = existing.map((p) => ({
      id: p.id,
      spots: p.spots,
      accommodations: p.accommodations,
      recommendedDates: p.recommended_dates,
    }))
  } else {
    // 트렌드 지역 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: trendingRaw } = await (supabase.from('trending_spots') as any)
      .select('*')
      .order('rank', { ascending: true })
      .limit(20)

    const areas = ((trendingRaw ?? []) as { area_code: string; area_name: string; rank: number }[]).map((r) => ({
      areaCode: r.area_code,
      areaName: r.area_name,
      rank: r.rank,
    }))

    const fallbackAreas = areas.length > 0 ? areas : [
      { areaCode: '6', areaName: '부산', rank: 1 },
      { areaCode: '39', areaName: '제주', rank: 2 },
      { areaCode: '32', areaName: '강원', rank: 3 },
      { areaCode: '38', areaName: '전남', rank: 4 },
      { areaCode: '35', areaName: '경북', rank: 5 },
    ]

    packages = await buildPackages(preference, fallbackAreas)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">맞춤 패키지</h1>
        <Link href="/chat?retake=1" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          취향 다시 탐색
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">패키지를 불러오지 못했어요.</p>
          <Link href="/chat?retake=1" className={cn(buttonVariants({ size: 'sm' }))}>
            다시 시도하기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  )
}
