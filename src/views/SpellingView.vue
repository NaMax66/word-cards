<script setup lang="ts">
  import { ref } from 'vue'
  import ButtonBase from '@/components/base/BaseButton.vue'
  import AppModal from '@/components/AppModal.vue'

  const word = ref()
  const hint = ref()
  const hiddenLettersIndexes = ref<boolean[]>([])

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
      hiddenLettersIndexes: hiddenLettersIndexes.value.reduce<number[]>((acc, current, index) => {
        if(current) {
          acc.push(index)
        }

        return acc
      }, [])
    })

    word.value = null
    hint.value = null
    hiddenLettersIndexes.value = []
  }

  function onLetterClick(idx: number) {
    hiddenLettersIndexes.value[idx] = !hiddenLettersIndexes.value[idx]
  }
</script>

<template>
  <main class="container spelling">
    <div class="p-2">
      <h1 class="spelling__header">Practice your spelling skill</h1>
      <ul>
        <li v-for="word in allWords" :key="word.uid">{{ `${word.word} - ${word.hint || '?'} - ${word.hiddenLettersIndexes.map(el => String(el))}` }}</li>
      </ul>
      <div class="mt-3">
        <button-base class="form-btn" theme="accent" @click="openAddWord">{{ $t('add word') }}</button-base>
      </div>
    </div>
    <Teleport to="modals-container">
      <AppModal :show="isAddWordOpened" @close="closeAddWord">
        <form @submit.prevent="addNewWord">
          <div class="add-word-modal d-flex flex-column">
            <label class="mb-2" for="add">
              {{ $t('the word') }}
            </label>
            <input id="add" v-model="word" class="textarea-base mb-3" name="add" required />
            <label class="mb-2" for="hint">
              {{ $t('hint') }}
            </label>
            <textarea id="hint" v-model="hint" class="textarea-base mb-3" />
            <div class="mb-3">
              <h4>Click to letters</h4>
              <div v-if="word" class="d-flex  mt-3 mb-3 gap-2 justify-center">
                <div @click="onLetterClick(idx)" class="letter" :class="{'letter--hidden': hiddenLettersIndexes[idx]}" v-for="(letter, idx) in word" :key="idx">
                  <span>{{ letter }}</span>
                </div>
              </div>

              <div v-else class="d-flex  mt-3 mb-3 gap-2 justify-center">
                <div class="letter letter--disabled" v-for="(letter, idx) in 'stub'" :key="idx">
                  {{ letter }}
                </div>
              </div>
            </div>

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

.form-btn {
  height: 4rem;
  padding: 0 2.5rem;
}

.add-word-modal {
  display: grid;
  grid-template-columns: 1fr;
  padding: 3rem 2rem 1.5rem;
  width: 90vw;
  max-width: 70rem;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--c-background);
  border-radius: var(--default-b-radius);
}

.letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: var(--default-b-radius);
  border: 1px solid var(--c-accent);
  text-transform: uppercase;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;

  &--disabled {
    opacity: 0.3;
    border-color: #000;
  }

  &--hidden {
    span {
      display: none;
    }
    &:after {
      content: "•";
    }
  }
}
</style>
