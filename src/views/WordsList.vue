<script lang="ts">
import { defineComponent } from 'vue'
import WordsTable from '@/components/WordsTable.vue'
import { useLangStore } from '@/stores/languages'
import { useWordListStore } from '@/stores/word-list'
import type { Pair } from '@/types/Pair'

export default defineComponent({
  components: { WordsTable },
  setup() {
    const { userLang, targetLang } = useLangStore()
    const { addPair: addPairInStore } = useWordListStore()

    const addPair = (e: SubmitEvent) => {
      const formData = new FormData(e.target as HTMLFormElement)
      addPairInStore({
        origin: {
          lang: userLang,
          value: formData.get('userLang') as string
        },
        translation: {
          lang: targetLang,
          value: formData.get('targetLang') as string
        }
      })
    }

    return {
      userLang,
      targetLang,

      addPair
    }
  }
})
</script>

<template>
  <main>
    <words-table class="mt-3 w-100" />
    <form class="d-flex align-end mt-3" @submit.prevent="addPair">
      <div>
        <label class="d-block" for="userLang">{{ userLang }}</label>
        <input required id="userLang" name="userLang">
      </div>
      <div class="ml-2">
        <label class="d-block" for="targetLang">{{ targetLang }}</label>
        <input required id="targetLang" name="targetLang">
      </div>
      <button class="ml-2" type="submit">{{ $t('add') }}</button>
    </form>
  </main>
</template>
