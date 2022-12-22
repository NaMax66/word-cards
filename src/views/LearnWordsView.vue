<script lang="ts">
 import { computed, ref, defineComponent } from 'vue'
 import { useWordListStore } from '@/stores/word-list'
 import { useLangStore } from '@/stores/languages'
 import { storeToRefs } from 'pinia'
 import flipCard from '@/stub/flipCard'
 import ButtonBase from '@/components/ButtonBase.vue'

 export default defineComponent({
   components: { ButtonBase },
   setup() {
     const { fetchWordList } = useWordListStore()
     fetchWordList()

     const { list } = storeToRefs(useWordListStore())
     const { userLang, targetLang } = useLangStore()

     const getRandomIndex = (maxIndex: number) => {
       return Math.floor(Math.random() * maxIndex)
     }

     let index = ref(getRandomIndex(list.value.length))

     setInterval(() => {
       index.value = getRandomIndex(list.value.length)
     }, 60000 * 5)

     const currentCard = computed(() => {
       return list.value[index.value] || flipCard
     })

     let lang = ref(userLang)

     const flip = () => {
       lang.value = lang.value === userLang ? targetLang : userLang
     }

     const next = () => {
       const id = index.value
       let newIndex = getRandomIndex(list.value.length)
       while(id === newIndex) {
         newIndex = getRandomIndex(list.value.length)
       }
       index.value = newIndex
     }

     return {
       currentCard,
       flip,
       next,
       lang
     }
   }
 })
</script>

<template>
  <main class="learn-words container">
     <div class="under-header">
       <article class="word-card">
         <h2 class="grow">{{ currentCard[lang] }}</h2>
       </article>
       <div class="card-controls">
         <button-base class="flip-btn" theme="default" @click="flip">{{ $t('flip') }}</button-base>
         <button-base  class="next-btn" theme="accent" @click="next">{{ $t('next') }}</button-base>
       </div>
     </div>
  </main>
</template>

<style scoped>
.learn-words {
  display: flex;
  flex-direction: column;
  padding: 0 8px;
}

.word-card {
  display: flex;
  gap: 12px;
  max-width: 350px;
  max-height: 600px;
  min-height: 90px;
  background-color: var(--main-color);
  box-shadow: var(--main-shodow-bottom);
  border-radius: var(--default-b-radius);
  padding: calc(var(--space) * 2);
}

.card-controls {
  position: relative;
  display: flex;
  width: auto;
  max-width: 350px;
  gap: 12px;
  margin-top: 24px;
}
.next-btn,
.flip-btn {
  flex-grow: 1;
  width: 40px;
  height: 40px;
}

@media (max-width: 500px) {
  .word-card {
    max-height: none;
    max-width: none;
  }
  .card-controls {
    max-width: none;
    position: fixed;
    width: calc(100% - 16px);
    bottom: 8px;
    left: 8px;
  }
}
</style>
