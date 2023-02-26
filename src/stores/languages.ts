import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Locale } from '@/types/Locale'
import { locale } from '@/types/Locale'

export const useLangStore = defineStore('languages', () => {
  const allLangs = ref(locale)
  const originLang = ref<Locale>(locale.ru)
  const setOriginLang = (lang: Locale) => {
    originLang.value = lang
  }

  const translationLang = ref<Locale>(locale.en)
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
