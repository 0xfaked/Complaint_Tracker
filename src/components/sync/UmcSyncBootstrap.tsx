import { useEffect } from 'react'

import { syncUmcComplaintsFromFeed } from '@/lib/umcSync'

export function UmcSyncBootstrap() {
  useEffect(() => {
    void syncUmcComplaintsFromFeed(true)
  }, [])

  return null
}
