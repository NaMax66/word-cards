import { getBrowserInterfaceLanguage } from '@/services/interfaceLanguage'

export function createFlipCardStub() {
  const interfaceLanguage = getBrowserInterfaceLanguage()

  if (interfaceLanguage === 'ru') {
    const stub = {
      origin: {
        value: 'добавь слово, чтобы запомнить',
        lang: 'ru'
      },
      translation: {
        value: 'add a word to remember',
        lang: 'en'
      },
      id: 1
    }

    return stub
  }

  const stub = {
    origin: {
      value: 'add a word to remember',
      lang: 'en'
    },
    translation: {
      value: 'добавь слово, чтобы запомнить',
      lang: 'ru'
    },
    id: 1
  }

  return stub
}
