import { ref } from 'vue'
import { defineStore } from 'pinia'
import httpClient from '@/services/httpClient'

export const useWordListStore = defineStore('word-list', () => {
  const list = ref<Array<any>>([])

  function addBond(bond: any) {
    list.value.push(bond)
  }

  async function fetchWordList() {
    const {data: { data }} = await httpClient.get('/word-list', {
      withCredentials: true
    })

    list.value = data
  }

  return {
    list,
    addBond,
    fetchWordList
  }
})
