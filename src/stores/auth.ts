import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const isAuth = ref(false)

  function setAuth() {
    isAuth.value = true
  }

  return { isAuth, setAuth }
})
