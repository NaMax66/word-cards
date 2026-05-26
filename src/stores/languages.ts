import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Locale } from '@/types/Locale'
import { locale } from '@/types/Locale'
import { getBrowserInterfaceLanguage } from '@/services/interfaceLanguage'

export const useLangStore = defineStore('languages', () => {
  const browserLanguage = getBrowserInterfaceLanguage()
  const allLangs = ref(locale)
  const originLang = ref<Locale>(browserLanguage === 'ru' ? locale.ru : locale.en)
  const setOriginLang = (lang: Locale) => {
    originLang.value = lang
  }

  const translationLang = ref<Locale>(browserLanguage === 'ru' ? locale.en : locale.ru)
  const setTranslationLang = (lang: Locale) => {
    translationLang.value = lang
  }

  return {
    originLang,
    setOriginLang,

    translationLang,
    setTranslationLang,

    allLangs
  }
})
