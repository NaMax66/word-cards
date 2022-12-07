<script lang="ts">
 import { computed, ref, defineComponent } from 'vue'
 import { useWordListStore } from '@/stores/word-list'
 import { useLangStore } from '@/stores/languages'
 import { storeToRefs } from 'pinia'
 import flipCard from '@/stub/flipCard'
 import ButtonBase from "@/components/ButtonBase.vue";

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

     const switchLang = () => {
       lang.value = lang.value === userLang ? targetLang : userLang
     }

     return {
       currentCard,
       switchLang,
       lang
     }
   }
 })
</script>

<template>
  <main class="mt-3">
      <article class="word-card">
        <h2 class="grow">{{ currentCard[lang] }}</h2>
        <button-base class="justify-self-end" theme="accent" @click="switchLang">{{ $t('flip') }}</button-base>
      </article>
  </main>
</template>

<style scoped>
.word-card {
  display: flex;
  gap: 12px;
  max-width: 350px;
  max-height: 600px;
  background-color: var(--main-color);
  box-shadow: var(--main-shodow-bottom);
  border-radius: var(--default-b-radius);
  padding: calc(var(--space) * 2);
}

@media (max-width: 500px) {
  .word-card {
    max-height: none;
    max-width: none;
  }
}
</style>
