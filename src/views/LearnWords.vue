<script lang="ts">
 import { computed, ref, defineComponent } from 'vue'
 import { useWordListStore } from '@/stores/word-list'
 import { useLangStore } from "@/stores/languages";

 import type { Locale } from "@/types/Locale";

 export default defineComponent({
   setup() {
     const { list } = useWordListStore()
     const { userLang, targetLang } = useLangStore()

     let index = ref(0)

     setInterval(() => {
       index.value = Math.floor(Math.random() * list.length)
     }, 25000)

     const currentCard = computed(() => {
       return list[index.value]
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
      <h2>{{ currentCard[lang] }}</h2>
      <button class="mt-2" @click="switchLang">{{ $t('flip') }}</button>
    </article>
  </main>
</template>

<style scoped>
.word-card {
  max-width: 350px;
  max-height: 600px;
  border-radius: 2px;
  border: 1px solid var(--c-border);
  padding: calc(var(--space) * 2);
}

</style>
