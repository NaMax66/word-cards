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
  <form class="add-pair" @submit.prevent="addPair" autocomplete="off">
    <div class="form-item">
      <label class="input-label" for="targetLang">{{ targetLang }}</label>
      <input-base class="w-100" required id="targetLang" name="targetLang" />
    </div>
    <div class="form-item">
      <label class="input-label" for="userLang">{{ userLang }}</label>
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
  position: fixed;
  bottom: 8px;
  width: calc(100% - 16px);
  backdrop-filter: blur(2px);
}

@media (max-width: 800px) {
  .add-pair {
    flex-direction: column;
    background-color: var(--main-color);
    box-shadow: var(--main-shodow-top);
    border-radius: var(--default-b-radius);
    padding: 8px;
    left: 8px;
  }
}

.form-item {
  flex-grow: 1;
  background-color: var(--main-color);
  box-shadow: var(--main-shodow-top);
  border-radius: var(--default-b-radius);
  padding: 12px 16px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
}

@media (max-width: 800px) {
  .form-item {
    background-color: transparent;
    box-shadow: none;
    padding: 0;
  }

  .input-label {
    display: none;
  }
}
</style>
