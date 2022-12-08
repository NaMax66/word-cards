<script lang="ts" setup>
  import { useLangStore } from '@/stores/languages'
  import { useWordListStore } from '@/stores/word-list'
  import ButtonBase from '@/components/ButtonBase.vue'
  import InputBase from '@/components/InputBase.vue'

  const { userLang, targetLang } = useLangStore()
  const { addPair: addPairInStore } = useWordListStore()

  const addPair = (e: Event) => {
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
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

    form.reset()
  }
</script>

<template>
  <form class="add-pair" @submit.prevent="addPair">
    <div class="form-item">
      <label class="d-block mb-2" for="targetLang">{{ targetLang }}</label>
      <input-base class="w-100" required id="targetLang" name="targetLang" />
    </div>
    <div class="form-item">
      <label class="d-block mb-2" for="userLang">{{ userLang }}</label>
      <input-base class="w-100" required id="userLang" name="userLang" />
    </div>
    <button-base class="p-3" type="submit" theme="accent">{{ $t('add') }}</button-base>
  </form>
</template>

<style scoped>
.add-pair {
  display: flex;
  max-width: 800px;
  gap: 12px;
}

@media (max-width: 800px) {
  .add-pair {
    flex-direction: column;
    position: fixed;
    bottom: 8px;
    width: calc(100% - 16px);
  }
}

.form-item {
  flex-grow: 1;
  background-color: var(--main-color);
  box-shadow: var(--main-shodow-top);
  border-radius: var(--default-b-radius);
  padding: 12px 16px;
}
</style>
