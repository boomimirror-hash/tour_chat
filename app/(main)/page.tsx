import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-56px)] px-4 text-center gap-8">
      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">
          AI가 찾아주는
          <br />
          나만의 여행 패키지
        </h1>
        <p className="text-muted-foreground text-base">
          짧은 대화로 취향을 파악하고
          <br />
          혼잡을 피하는 맞춤 일정을 만들어 드려요.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href={user ? '/chat' : '/signup'}
          className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
        >
          지금 시작하기
        </Link>
        {!user && (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
          >
            로그인
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-sm text-sm text-muted-foreground">
        <div className="space-y-1">
          <div className="text-2xl">💬</div>
          <p>AI 대화로<br />취향 파악</p>
        </div>
        <div className="space-y-1">
          <div className="text-2xl">📊</div>
          <p>빅데이터로<br />트렌드 감지</p>
        </div>
        <div className="space-y-1">
          <div className="text-2xl">🗓️</div>
          <p>혼잡 피하는<br />날짜 추천</p>
        </div>
      </div>
    </div>
  )
}
