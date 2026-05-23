import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import httpClient, { postOptions } from '@/services/httpClient'
import type { Pair } from '@/types/Pair'
import { isDetailedPair } from '@/DTO/DetailedPair'
import type { DetailedPair } from '@/DTO/DetailedPair'
import cloneDeep from 'lodash.clonedeep'
import checkIsSignedIn from '@/services/checkIsSignedIn'

type WordListPage = {
  items: unknown[]
  nextCursor: string | null
}

type RandomPairResponse = {
  pair: unknown
  count: number
}

export const useWordListStore = defineStore('word-list', () => {
  const list = ref<Array<Pair>>([])

  const filterPhrase = ref<string>('')
  const filteredList = computed(() => list.value)
  const nextCursor = ref<string | null>(null)
  const hasMore = computed(() => Boolean(nextCursor.value))
  const isLoading = ref(false)
  const randomPair = ref<Pair | null>(null)
  const pairsCount = ref(0)
  let activeListRequest = 0

  async function addPair(pair: Omit<DetailedPair, 'id'>) {
    const tmpId = Date.now()
    const element = { ...pair, id: tmpId, isSyncing: true }
    if(!filterPhrase.value) {
      list.value.push(element)
    }

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
      const index = list.value.findIndex((el) => el.id === pair.id)
      if(index !== -1) {
        list.value.splice(index, 1, cloneDeep(pair))
      }
      if(randomPair.value?.id === pair.id) {
        randomPair.value = cloneDeep(pair)
      }
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

  async function fetchWordList({ reset = true } = {}) {
    if(!checkIsSignedIn()) return
    if(!reset && isLoading.value) return

    if(reset) {
      nextCursor.value = null
    } else if(!nextCursor.value) {
      return
    }

    const requestId = activeListRequest + 1
    activeListRequest = requestId
    isLoading.value = true

    try {
      const { data: { data } } = await httpClient.get('/word-list', {
        withCredentials: true,
        params: {
          limit: 50,
          cursor: reset ? undefined : nextCursor.value,
          search: filterPhrase.value.trim() || undefined
        }
      }) as { data: { data: WordListPage } }

      const items = data.items.filter(isDetailedPair).reverse()
      if(requestId !== activeListRequest) return

      nextCursor.value = data.nextCursor

      list.value = reset ? items : [...items, ...list.value]
    } catch (e) {
      console.error(e)
    } finally {
      if(requestId === activeListRequest) {
        isLoading.value = false
      }
    }
  }

  async function fetchRandomPair() {
    if(!checkIsSignedIn()) return

    try {
      const { data: { data } } = await httpClient.get('/random-pair', {
        withCredentials: true,
        params: {
          exclude: randomPair.value?.id
        }
      }) as { data: { data: RandomPairResponse } }

      pairsCount.value = data.count
      randomPair.value = isDetailedPair(data.pair) ? data.pair : null
    } catch (e) {
      console.error(e)
    }
  }

  return {
    list,
    addPair,
    removePair,
    updatePair,
    fetchWordList,
    fetchRandomPair,

    filteredList,
    filterPhrase,
    hasMore,
    isLoading,
    randomPair,
    pairsCount
  }
})
