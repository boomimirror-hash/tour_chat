import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ExistingProfileBanner() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>이전 취향 프로필이 있어요</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            저장된 취향으로 바로 패키지를 추천받거나,
            <br />
            처음부터 다시 탐색할 수 있어요.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/packages" className={cn(buttonVariants(), 'w-full justify-center')}>
              이전 취향으로 추천받기
            </Link>
            <Link href="/chat?retake=1" className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}>
              다시 탐색하기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
