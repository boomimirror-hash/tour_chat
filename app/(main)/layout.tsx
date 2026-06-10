import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="h-14 border-b flex items-center px-4 gap-4 bg-background sticky top-0 z-10">
        <Link href="/" className="font-bold text-base shrink-0">여행 플래너</Link>
        <nav className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Link href="/chat" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                탐색
              </Link>
              <Link href="/packages" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                패키지
              </Link>
              <Link href="/my" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                저장
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                로그인
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>
                회원가입
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/auth/logout" method="POST">
      <button
        type="submit"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
      >
        로그아웃
      </button>
    </form>
  )
}
