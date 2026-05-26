import type { Settings } from '@/types/Settings'
import { getBrowserInterfaceLanguage } from '@/services/interfaceLanguage'

export function createDefaultSettings(): Settings {
  return {
    interfaceLang: getBrowserInterfaceLanguage(),
    columnOrder: ['origin', 'translation'],
    fillFormOrder: ['translation', 'origin']
  }
}

const settings: Settings = createDefaultSettings()

export default settings
