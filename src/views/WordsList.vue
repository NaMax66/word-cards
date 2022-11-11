<script lang="ts">
import { defineComponent } from 'vue'
import WordsTable from '@/components/WordsTable.vue'

export default defineComponent({
  components: { WordsTable },
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
    <words-table class="w-100" />
    <form>
      <label for="firstLang">{{ firstLang }}</label>
      <label for="secondLang">{{ secondLang }}</label>
    </form>
  </main>
</template>
