<script setup lang="ts">
  import { ref } from 'vue'
  import ButtonBase from '@/components/base/BaseButton.vue'

  const word = ref()
  const allWords = ref<string[]>([])

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
      <form @submit.prevent="addNewWord">
        <label for="add" class="d-block mt-3 mb-2">
          Add new word
        </label>
        <div class="d-flex gap-2">
          <input v-model="word" class="textarea-base" name="add" required />
          <button-base class="submit-btn" type="submit" theme="accent">Add</button-base>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped lang="scss">
@import "@/assets/media.scss";

.spelling {
  &__header {
    padding-top: 112px;
  }
}

.submit-btn {
  height: 4rem;
  flex-shrink: 0;
  padding: 0 2.5rem;
}
</style>
