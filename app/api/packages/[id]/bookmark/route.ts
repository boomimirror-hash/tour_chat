import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('bookmarks') as any)
    .select('id')
    .eq('package_id', id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('bookmarks') as any).delete().eq('id', (existing as { id: string }).id)
    return NextResponse.json({ bookmarked: false })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('bookmarks') as any).insert({ user_id: user.id, package_id: id })
  return NextResponse.json({ bookmarked: true })
}
