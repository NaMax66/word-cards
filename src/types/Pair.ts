import type { Locale } from '@/types/Locale'

type Sync = {
  isSyncing?: boolean,
}

type Id = {
  id: string | number
}

export type Pair = {
  pair: {
    [key: Locale]: string
  },
} & Sync & Id
