<script lang="ts">
import { defineComponent, ref } from 'vue'
import WordsTable from '@/components/WordsTable.vue'
import { useLangStore } from '@/stores/languages'
import { useWordListStore } from '@/stores/word-list'

export default defineComponent({
  components: { WordsTable },
  setup() {
    const { userLang, targetLang } = useLangStore()
    const { addBond: addBondInStore } = useWordListStore()

    const img = ref('')

    const addBond =  async (e: SubmitEvent) => {
      const formData = new FormData(e.target as HTMLFormElement)
      addBondInStore({
        [userLang]: formData.get('userLang'),
        [targetLang]: formData.get('targetLang')
      })

      const res = await fetch(`http://localhost:5000/get-img?query=${formData.get('targetLang')}&lang=en`)

      img.value = await res.text()
    }


    return {
      userLang,
      targetLang,

      addBond,

      img
    }
  }
})
</script>

<template>
  <main>
    <words-table class="mt-3 w-100" />
    <form class="d-flex align-end mt-3" @submit.prevent="addBond">
      <div>
        <label class="d-block" for="userLang">{{ userLang }}</label>
        <input id="userLang" name="userLang">
      </div>
      <div class="ml-2">
        <label class="d-block" for="targetLang">{{ targetLang }}</label>
        <input id="targetLang" name="targetLang">
      </div>
      <button class="ml-2" type="submit">{{ $t('add') }}</button>
    </form>
    <div class="mt-3">
      <img :src="img">
    </div>
  </main>
</template>
