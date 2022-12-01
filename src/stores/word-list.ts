import { ref } from 'vue'
import { defineStore } from 'pinia'
import httpClient, { postOptions } from '@/services/httpClient'
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
      await httpClient.post('/add-pair', pair, postOptions)
    } catch (e) {
      console.error(e)
    }
  }

  async function removePair(pairId: string) {
    list.value = list.value.filter(el => el.id !== pairId)
    try {
      await httpClient.post('/remove-pair', { pair_uid: pairId }, postOptions)
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
    removePair,
    fetchWordList
  }
})
