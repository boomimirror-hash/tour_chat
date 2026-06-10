'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface BookmarkButtonProps {
  packageId: string
  initialBookmarked: boolean
}

export function BookmarkButton({ packageId, initialBookmarked }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/packages/${packageId}/bookmark`, { method: 'POST' })
      const data = await res.json()
      setBookmarked(data.bookmarked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading}>
      {bookmarked ? '★ 저장됨' : '☆ 저장하기'}
    </Button>
  )
}
