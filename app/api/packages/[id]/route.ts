import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: pkg } = await supabase
    .from('packages')
    .select('*')
    .eq('id', id)
    .single()

  if (!pkg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let isBookmarked = false
  if (user) {
    const { data: bm } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('package_id', id)
      .eq('user_id', user.id)
      .single()
    isBookmarked = !!bm
  }

  return NextResponse.json({ package: pkg, isBookmarked })
}
