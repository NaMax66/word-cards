import type { DetailedPair } from '@/DTO/DetailedPair'

type Sync = {
  isSyncing?: boolean,
}

export type Pair = DetailedPair & Sync
