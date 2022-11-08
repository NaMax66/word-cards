<script lang="ts">
import { defineComponent } from 'vue'
import WordList from "@/components/WordList.vue";

export default defineComponent({
  setup() {
    const firstLang = 'ru'
    const secondLang = 'en'

    return {
      firstLang,
      secondLang
    }
  }
})
</script>

<template>
  <main>
    <words-list />
    <form>
      <label for="firstLang">{{ firstLang }}</label>
      <label for="secondLang">{{ secondLang }}</label>
    </form>
  </main>
</template>
