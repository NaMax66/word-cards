import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import wordList from '@/mock/wordList'


export const useWordListStore = defineStore('word-list', () => {
  const list = reactive(wordList)
  const cardId = setInterval(() => {
    return Math.floor(Math.random() * list.length)
  }, 2000)

  const currentCard = computed(() => list[cardId])

  function addBond(bond: any) {
    list.push(bond)
  }

  return {
    list,
    addBond,

    currentCard,
  }
})
