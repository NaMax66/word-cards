<script setup lang="ts">
  import { ref } from 'vue'
  import ButtonBase from '@/components/base/BaseButton.vue'
  import AppModal from '@/components/AppModal.vue'

  const word = ref()
  const allWords = ref<string[]>([])

  const isAddWordOpened = ref(false)

  function openAddWord() {
    isAddWordOpened.value = true
  }

  function closeAddWord() {
    isAddWordOpened.value = false
  }

  function addNewWord() {
    allWords.value.push(word.value)
    word.value = null
  }
</script>

<template>
  <main class="container spelling">
    <div class="p-2">
      <h1 class="spelling__header">Practice your spelling skill</h1>
      <ul>
        <li v-for="word in allWords" :key="word">{{ word }}</li>
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
            <div class="d-flex gap-2">
              <input id="add" v-model="word" class="textarea-base" name="add" required />
              <button-base class="submit-btn" type="submit" theme="accent"> {{ $t('add') }} </button-base>
            </div>
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
