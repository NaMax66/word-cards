import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import wordList from '@/mock/wordList'


export const useWordListStore = defineStore('word-list', () => {
  const list = reactive(wordList)

  function addBond(bond: any) {
    list.push(bond)
  }

  return {
    list,
    addBond
  }
})
