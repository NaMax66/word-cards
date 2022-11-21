import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Locale } from '@/types/Locale'


export const useLangStore = defineStore('languages', () => {
  const userLang = ref<Locale>('ru')
  const setUserLang = (lang: Locale) => {
    userLang.value = lang
  }

  const targetLang = ref<Locale>('en')
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
