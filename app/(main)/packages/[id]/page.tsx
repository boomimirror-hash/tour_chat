import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PackageDetail } from '@/components/package/PackageDetail'
import type { TourPackage } from '@/types/package'

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw } = await (supabase.from('packages') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (!raw) notFound()

  // 비회원은 상세 조회 불가 (RLS에서 막히지만 UX 차원에서 명시)
  if (!user) redirect('/login')

  const pkg: TourPackage = {
    id: raw.id,
    spots: raw.spots,
    accommodations: raw.accommodations,
    recommendedDates: raw.recommended_dates,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bm } = await (supabase.from('bookmarks') as any)
    .select('id')
    .eq('package_id', id)
    .eq('user_id', user.id)
    .single()

  return (
    <PackageDetail pkg={pkg} isBookmarked={!!bm} isLoggedIn={!!user} />
  )
}
