<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useWordListStore } from '@/stores/word-list'
import { storeToRefs } from 'pinia'

import ButtonBase from '@/components/ButtonBase.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import AppModal from './AppModal.vue'
import type {Pair} from '@/types/Pair'

export default defineComponent({
  components: { AppModal, IconPencil, ButtonBase },

  setup() {
    const { fetchWordList, removePair, updatePair: updatePairApi } = useWordListStore()
    fetchWordList()

    const { list } = storeToRefs(useWordListStore())

    const isEditOpened = ref(false)
    const editPair = ref<Pair | undefined>(undefined)

    async function updatePair() {
      if(!editPair.value) return
      await updatePairApi(editPair.value)
      closeEdit()
    }

    function remove(pairId: string | number) {
      removePair(pairId)
    }

    function openEdit(pairId: string | number) {
      const pair: Pair | undefined = list.value.find(el => el.id === pairId)
      if(pair) editPair.value = pair
      isEditOpened.value = true
    }

    function closeEdit() {
      editPair.value = undefined
      isEditOpened.value = false
    }

    return {
      wordList: list,
      remove,

      isEditOpened,
      openEdit,
      closeEdit,

      editPair,

      updatePair
    }
  }
})
</script>

<template>
  <div class="words-list-wrap">
    <TransitionGroup name="word-list" class="word-list" tag="ul">
      <li class="words-list__item" v-for="item in wordList" :key="item.id">
        <p class="words-list__text">{{ item.origin.value }}</p>
        <div class="separator"></div>
        <p class="words-list__text">{{ item.translation.value }}</p>


        <div class="hidden-controls">
          <button-base class="hidden-controls__btn" @click="openEdit(item.id)">
            <icon-pencil class="hidden-controls__icon" />
          </button-base>
          <button-base class="hidden-controls__btn" @click="remove(item.id)">x</button-base>
        </div>
      </li>
    </TransitionGroup>
    <Teleport to="modals-container">
      <AppModal :show="isEditOpened" @close="closeEdit">
        <div class="edit-modal d-flex flex-column">
          <div class="edit-modal__row">
            <label for="origin">
              {{ $t('origin') }}
            </label>
            <textarea class="textarea-base" id="origin" v-model="editPair.origin.value"></textarea>
          </div>
          <div class="edit-modal__row">
            <label for="translation">
              {{ $t('translation') }}
            </label>
            <textarea class="textarea-base" id="translation" v-model="editPair.translation.value"></textarea>
          </div>
          <button-base class="save-edit-btn" @click="updatePair">Save</button-base>
        </div>
      </AppModal>
    </Teleport>
  </div>
</template>

<style lang="scss">
.words-list {
  display: flex;
  flex-direction: column-reverse;

  &__item {
    display: flex;
    background-color: var(--main-color);
    box-shadow: var(--main-shodow-bottom);
    border-radius: var(--default-b-radius);
    margin-bottom: 12px;
    padding: 4px 8px;
    transition: all .3s;

    &:hover,
    &:active {
      .hidden-controls {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  &__text {
    width: 50%;
    padding: var(--space) calc(var(--space) * 2);
    overflow: hidden;

    &:last-child {
      border-bottom-right-radius: var(--default-b-radius);
      border-top-right-radius: var(--default-b-radius);
    }

    &:first-child {
      border-top-left-radius: var(--default-b-radius);
      border-bottom-left-radius: var(--default-b-radius);
    }
  }
}

.separator {
  width: 2px;
  background-color: var(--c-accent);
}

.hidden-controls {
  margin-top: 4px;
  visibility: hidden;
  opacity: 0;
  display: flex;
  gap: 8px;

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
  }

  &__icon {
    width: 18px;
    height: 18px;
  }
}

.word-list-move,
.word-list-enter-active,
.word-list-leave-active {
  transition: all 0.3s;
}

.word-list-enter-from,
.word-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.word-list-leave-active {
  position: absolute;
  width: 100%;
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
}

.save-edit-btn {
  height: 4rem;
  margin-top: auto;
  flex-shrink: 0;
}
</style>
