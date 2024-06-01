<script setup lang="ts">
  import { ref } from 'vue'
  import ButtonBase from '@/components/base/BaseButton.vue'
  import AppModal from '@/components/AppModal.vue'

  const word = ref()
  const hint = ref()

  type WordType = {
    uid: string,
    word: string,
    hint: string,
    hiddenLettersIndexes: Array<number>
  }

  const allWords = ref<WordType[]>([])

  const isAddWordOpened = ref(false)

  function openAddWord() {
    isAddWordOpened.value = true
  }

  function closeAddWord() {
    isAddWordOpened.value = false
  }

  function addNewWord() {
    allWords.value.push({
      uid: Math.random().toString(36).substr(2, 5),
      word: word.value,
      hint: hint.value,
      hiddenLettersIndexes: []
    })
    word.value = null
    hint.value = null
  }
</script>

<template>
  <main class="container spelling">
    <div class="p-2">
      <h1 class="spelling__header">Practice your spelling skill</h1>
      <ul>
        <li v-for="word in allWords" :key="word.uid">{{ word.word + '-' + word.hint }}</li>
      </ul>
      <div class="mt-3">
        <button-base class="add-word-btn" theme="accent" @click="openAddWord">{{ $t('add word') }}</button-base>
      </div>
    </div>
    <Teleport to="modals-container">
      <AppModal :show="isAddWordOpened" @close="closeAddWord">
        <form @submit.prevent="addNewWord">
          <div class="add-word-modal d-flex flex-column">
            <label class="mb-2" for="add">
              {{ $t('The word') }}
            </label>
            <input id="add" v-model="word" class="textarea-base" name="add" required />
            <label class="mb-2" for="hint">
              {{ $t('hint') }}
            </label>
            <textarea id="hint" v-model="hint" class="textarea-base" required />
            <button-base class="submit-btn" type="submit" theme="accent"> {{ $t('add') }} </button-base>
          </div>
        </form>
      </AppModal>
    </Teleport>
  </main>
</template>

<style scoped lang="scss">
@import "@/assets/media.scss";

.spelling {
  &__header {
    padding-top: 60px;
  }
}

.submit-btn {
  height: 4rem;
  flex-shrink: 0;
  padding: 0 2.5rem;
}

.add-word-btn {
  height: 4rem;
  padding: 0 2.5rem;
}

.add-word-modal {
  display: grid;
  grid-template-columns: 1fr;
  padding: 3rem 2rem 1.5rem;
  width: 90vw;
  max-width: 50rem;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--c-background);
  border-radius: var(--default-b-radius);
}
</style>
