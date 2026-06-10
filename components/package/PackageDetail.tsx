import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CongestionCalendar } from './CongestionCalendar'
import { BookmarkButton } from './BookmarkButton'
import type { TourPackage } from '@/types/package'

interface PackageDetailProps {
  pkg: TourPackage
  isBookmarked: boolean
  isLoggedIn: boolean
}

const ACC_TYPE_LABEL: Record<string, string> = {
  hotel: '호텔·펜션',
  pension: '펜션',
  camping: '캠핑장',
  glamping: '글램핑',
}

export function PackageDetail({ pkg, isBookmarked, isLoggedIn }: PackageDetailProps) {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-bold leading-tight">
          {pkg.spots[0]?.title ?? '패키지'} 여행
        </h1>
        {isLoggedIn && (
          <BookmarkButton packageId={pkg.id} initialBookmarked={isBookmarked} />
        )}
      </div>

      {/* 관광지 목록 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">관광지</h2>
        <div className="space-y-3">
          {pkg.spots.map((spot) => (
            <div key={spot.contentId} className="flex gap-3 items-start">
              <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                {spot.imageUrl && (
                  <Image src={spot.imageUrl} alt={spot.title} fill className="object-cover" sizes="80px" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{spot.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{spot.address}</p>
              </div>
            </div>
          ))}
          {pkg.spots.length === 0 && (
            <p className="text-sm text-muted-foreground">관광지 정보가 없습니다.</p>
          )}
        </div>
      </section>

      <Separator />

      {/* 숙박 목록 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">숙박</h2>
        <div className="space-y-3">
          {pkg.accommodations.map((acc) => (
            <div key={acc.contentId} className="flex gap-3 items-start">
              <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                {acc.imageUrl && (
                  <Image src={acc.imageUrl} alt={acc.title} fill className="object-cover" sizes="80px" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{acc.title}</p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {ACC_TYPE_LABEL[acc.type] ?? acc.type}
                  </Badge>
                  {acc.petFriendly && (
                    <Badge variant="secondary" className="text-xs">반려동물 가능</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{acc.address}</p>
              </div>
            </div>
          ))}
          {pkg.accommodations.length === 0 && (
            <p className="text-sm text-muted-foreground">숙박 정보가 없습니다.</p>
          )}
        </div>
      </section>

      <Separator />

      {/* 추천 날짜·혼잡도 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">추천 날짜 (혼잡도 낮은 순)</h2>
        <CongestionCalendar dates={pkg.recommendedDates} />
      </section>
    </div>
  )
}
