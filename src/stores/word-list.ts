import { ref } from 'vue'
import { defineStore } from 'pinia'
import httpClient, { postOptions } from '@/services/httpClient'
import type { Pair } from '@/types/Pair'
import { isDetailedPair } from '@/DTO/DetailedPair'
import type { DetailedPair } from '@/DTO/DetailedPair'
import cloneDeep from 'lodash.clonedeep'

export const useWordListStore = defineStore('word-list', () => {
  const list = ref<Array<Pair>>([])

  async function addPair(pair: Omit<DetailedPair, 'id'>) {
    const tmpId = Date.now()
    const element = { ...pair, id: tmpId, isSyncing: true }
    list.value.push(element)
    try {
      const { data: { data: { uid } } } = await httpClient.post('/add-pair', pair, postOptions)

      element.id = uid
      element.isSyncing = false
    } catch (e) {
      console.error(e)
    }
  }

  async function updatePair(pair: DetailedPair) {
    try {
      await httpClient.post('/update-pair', pair, postOptions)
      list.value.splice(list.value.findIndex((el) => el.id === pair.id), 1, cloneDeep(pair))
    } catch (e) {
      console.error(e)
    }
  }

  async function removePair(pairId: string | number) {
    list.value = list.value.filter(el => el.id !== pairId)
    try {
      await httpClient.post('/remove-pair', { pair_uid: pairId }, postOptions)
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchWordList() {
    try {
      const { data: { data } } = await httpClient.get('/word-list', {
        withCredentials: true
      }) as { data: { data: unknown[] } }

     if(data.every(isDetailedPair)) {
       list.value = data
     }
    } catch (e) {
      console.error(e)
    }
  }

  return {
    list,
    addPair,
    removePair,
    updatePair,
    fetchWordList
  }
})
