import { ref } from 'vue'
import { defineStore } from 'pinia'
import httpClient from '@/services/httpClient'
import type { Pair } from '@/types/Pair'
import type { DetailedPair } from '@/DTO/DetailedPair'

export const useWordListStore = defineStore('word-list', () => {
  const list = ref<Array<Pair>>([])

  async function addPair(pair: DetailedPair) {
    list.value.push({
      [pair.origin.lang]: pair.origin.value,
      [pair.translation.lang]: pair.translation.value
    })
    try {
      await httpClient.post('/add-pair', pair, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      })
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchWordList() {
    const {data: { data }} = await httpClient.get('/word-list', {
      withCredentials: true
    })

    list.value = data
  }

  return {
    list,
    addPair,
    fetchWordList
  }
})
