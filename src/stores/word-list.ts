import { ref } from 'vue'
import { defineStore } from 'pinia'
import httpClient, { postOptions } from '@/services/httpClient'
import type { Pair } from '@/types/Pair'
import { isDetailedPair } from '@/DTO/DetailedPair'
import type { DetailedPair } from '@/DTO/DetailedPair'
import { getAllFromCash, putToCash, removeElementByIdAndPrefix, syncCash } from '@/services/cashControl'

export const useWordListStore = defineStore('word-list', () => {
  const list = ref<Array<Pair>>([])

  async function addPair(pair: Omit<DetailedPair, 'id'>) {
    const tmpId = Date.now()
    const element = {...pair, id: tmpId, isSyncing: true}
    list.value.push(element)
    try {
      const {data: { data: { uid } }} = await httpClient.post('/add-pair', pair, postOptions)

      element.id = uid
      element.isSyncing = false
      putToCash(element)
    } catch (e) {
      console.error(e)
      putToCash(Object.assign(pair, { id: tmpId }), 'unsync_pair')
    }
  }

  async function updatePair(pair: DetailedPair) {
    try {
      await httpClient.post('/update-pair', pair, postOptions)
    } catch (e) {
      console.error(e)
    }
  }

  async function removePair(pairId: string | number) {
    list.value = list.value.filter(el => el.id !== pairId)
    try {
      await httpClient.post('/remove-pair', { pair_uid: pairId }, postOptions)
      /* todo make without prefix logic */
      removeElementByIdAndPrefix(pairId, 'pair')
    } catch (e) {
      // remove only if the element exist locally
      removeElementByIdAndPrefix(pairId, 'unsync_pair')
      console.error(e)
    }
  }

  async function fetchWordList() {
    try {
      const {data: { data }} = await httpClient.get('/word-list', {
        withCredentials: true
      }) as { data: { data: unknown[] } }

     if(!data.every(isDetailedPair)) throw new Error('wrong data from the server!')

      list.value = data
      syncCash(data)
      syncUnsincedData(addPair)
    } catch (e) {
      console.error(e)
      list.value = getAllFromCash('pair').concat(getAllFromCash('unsync_pair'))
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

function syncUnsincedData(cb: (el: DetailedPair) => Promise<void>) {
  const unsynced = getAllFromCash('unsync_pair')

  unsynced.forEach(el => {
    cb(el).then(() => {
      removeElementByIdAndPrefix(el.id, 'unsync_pair')
    })
  })
}
