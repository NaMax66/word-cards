import { ref } from 'vue'
import { defineStore } from 'pinia'
import httpClient, { postOptions } from '@/services/httpClient'
import type { Pair } from '@/types/Pair'
import type { DetailedPair } from '@/DTO/DetailedPair'
import { putToCash, syncCash } from '@/services/cashControl'

export const useWordListStore = defineStore('word-list', () => {
  const list = ref<Array<Pair>>([])

  async function addPair(pair: DetailedPair) {
    const tmpId = Date.now()
    const element = {
      pair: {
        [pair.origin.lang]: pair.origin.value,
        [pair.translation.lang]: pair.translation.value,
      },
      isSyncing: true,
      id: tmpId
    }
    list.value.push(element)
    try {
      const {data: { data: { uid } }} = await httpClient.post('/add-pair', pair, postOptions)

      element.id = uid
      element.isSyncing = false
      putToCash(element)
    } catch (e) {
      putToCash(element, 'unsync_pair')
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
    try {
      const {data: { data }} = await httpClient.get('/word-list', {
        withCredentials: true
      }) as { data: { data: Pair[] } }

      list.value = data
      syncCash(data)
    } catch (e) {
      console.error(e)
    }
  }

  return {
    list,
    addPair,
    removePair,
    fetchWordList
  }
})
