<script lang="ts" setup>
  import { ref } from 'vue'
  import { useLangStore } from '@/stores/languages'
  import { useWordListStore } from '@/stores/word-list'
  import ButtonBase from '@/components/ButtonBase.vue'
  import AppModal from './AppModal.vue'
  import type {Pair} from '@/types/Pair'

  const { originLang, translationLang } = useLangStore()
  const { addPair: addPairInStore } = useWordListStore()
  const { allLangs } = useLangStore()

  const isAddFormShown = ref(false)

  const emit = defineEmits(['added'])

  const addPair = (e: Event) => {
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const pair: Omit<Pair, 'id'> = {
      origin: {
        lang: formData.get('originLang') as string,
        value: formData.get('originValue') as string
      },
      translation: {
        lang: formData.get('translationLang') as string,
        value: formData.get('translationValue') as string
      }
    }
    addPairInStore(pair)

    emit('added', pair)

    form.reset()
    closeAddForm()
  }

  function openAddForm() {
    isAddFormShown.value = true
  }

  function closeAddForm() {
    isAddFormShown.value = false
  }
</script>

<template>
  <div class="add-pair">
    <button-base @click="openAddForm" class="add-pair-btn" theme="accent">{{ $t('add pair') }}</button-base>
    <Teleport to="modals-container">
      <AppModal :show="isAddFormShown" @close="closeAddForm">
        <form class="edit-modal" @submit.prevent="addPair" autocomplete="off">
          <label for="translation" class="mb-2">
            {{ $t('translation') }}
          </label>
          <div class="edit-modal__row">
            <textarea class="textarea-base" id="translation" name="translationValue"></textarea>
            <select class="select-base" name="translationLang" :value="translationLang">
              <option v-for="lang in allLangs" :key="lang">{{ lang }}</option>
            </select>
          </div>
          <label for="origin" class="mb-2">
            {{ $t('origin') }}
          </label>
          <div class="edit-modal__row">
            <textarea class="textarea-base" id="origin" name="originValue"></textarea>
            <select class="select-base" name="originLang" :value="originLang">
              <option v-for="lang in allLangs" :key="lang">{{ lang }}</option>
            </select>
          </div>
          <button-base class="submit-btn" type="submit" theme="accent">{{ $t('add') }}</button-base>
        </form>
      </AppModal>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/media.scss";
.edit-modal {
  display: flex;
  flex-direction: column;
}

.add-pair-btn {
  height: 100%;
  width: 100%;
}

.submit-btn {
  margin-top: 2rem;
  height: 4rem;
  flex-shrink: 0;
  padding: 0 2.5rem;
}

.edit-modal {
  padding: 3rem 2rem 1.5rem;
  width: 90vw;
  max-width: 50rem;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--c-background);
  border-radius: var(--default-b-radius);

  &__row {
    display: grid;
    grid-template-columns: 1fr 6.5rem;
    gap: calc(var(--space) * 3);
    margin-bottom: 2rem;
    align-items: start;
  }
}
</style>
