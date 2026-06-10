import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import type { TourPackage } from '@/types/package'

interface PackageCardProps {
  pkg: TourPackage
}

const CONGESTION_COLOR: Record<string, string> = {
  '매우 여유': 'bg-green-100 text-green-700',
  '여유': 'bg-blue-100 text-blue-700',
  '보통': 'bg-yellow-100 text-yellow-700',
}

export function PackageCard({ pkg }: PackageCardProps) {
  const mainSpot = pkg.spots[0]
  const bestDate = pkg.recommendedDates[0]

  return (
    <Link href={`/packages/${pkg.id}`} className="block group">
      <div className="rounded-2xl border bg-card overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-44 bg-muted">
          {mainSpot?.imageUrl ? (
            <Image
              src={mainSpot.imageUrl}
              alt={mainSpot.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              이미지 없음
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-base leading-tight">
            {mainSpot?.title ?? '관광지 정보 없음'}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {mainSpot?.address}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {bestDate && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONGESTION_COLOR[bestDate.label]}`}>
                {bestDate.date} · {bestDate.label}
              </span>
            )}
            {pkg.accommodations[0] && (
              <Badge variant="secondary" className="text-xs">
                {pkg.accommodations[0].type === 'camping' || pkg.accommodations[0].type === 'glamping'
                  ? '캠핑'
                  : '숙박'}{' '}
                포함
              </Badge>
            )}
            {pkg.spots.some((s) => s.category === 'A04') && (
              <Badge variant="secondary" className="text-xs">레포츠</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
