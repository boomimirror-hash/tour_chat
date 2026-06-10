import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PackageCard } from '@/components/package/PackageCard'
import type { TourPackage } from '@/types/package'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bookmarks } = await (supabase.from('bookmarks') as any)
    .select('package_id, packages(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const packages: TourPackage[] = ((bookmarks ?? []) as {
    package_id: string
    packages: {
      id: string
      spots: TourPackage['spots']
      accommodations: TourPackage['accommodations']
      recommended_dates: TourPackage['recommendedDates']
    }
  }[]).map((b) => ({
    id: b.packages.id,
    spots: b.packages.spots,
    accommodations: b.packages.accommodations,
    recommendedDates: b.packages.recommended_dates,
  }))

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold">저장한 패키지</h1>
      {packages.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          저장한 패키지가 없어요.
        </p>
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
