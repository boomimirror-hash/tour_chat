import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ExistingProfileBanner } from '@/components/chat/ExistingProfileBanner'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ retake?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { searchParams: sp } = { searchParams: await searchParams }

  const { data: existing } = await supabase
    .from('preference_profiles')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const hasProfile = !!existing
  const isRetake = sp?.retake === '1'

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)]">
      {hasProfile && !isRetake && <ExistingProfileBanner />}
      {(!hasProfile || isRetake) && <ChatWindow />}
    </div>
  )
}
