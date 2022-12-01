import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Locale } from '@/types/Locale'
import { locale } from '@/types/Locale'

export const useLangStore = defineStore('languages', () => {
  const userLang = ref<Locale>(locale.ru)
  const setUserLang = (lang: Locale) => {
    userLang.value = lang
  }

  const targetLang = ref<Locale>(locale.en)
  const setTargetLang = (lang: Locale) => {
    targetLang.value = lang
  }

  return {
    userLang,
    setUserLang,

    targetLang,
    setTargetLang
  }
})
