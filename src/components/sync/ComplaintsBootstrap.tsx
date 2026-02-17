import { useEffect } from 'react'

import { useComplaintsStore } from '@/store/complaintsStore'

export function ComplaintsBootstrap() {
  const loadComplaints = useComplaintsStore((s) => s.loadComplaints)

  useEffect(() => {
    void loadComplaints()
  }, [loadComplaints])

  return null
}
