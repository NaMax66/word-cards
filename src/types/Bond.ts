import type { Locale } from '@/types/Locale'

export type Bond = {
  [key in Locale]: string
}
