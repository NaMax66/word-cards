<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useWordListStore } from '@/stores/word-list'
import { storeToRefs } from 'pinia'
import cloneDeep from 'lodash.clonedeep'

import ButtonBase from '@/components/base/BaseButton.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import AppModal from './AppModal.vue'
import type { Pair } from '@/types/Pair'

import { useLangStore } from '@/stores/languages'
import { useUserDataStore } from '@/stores/userData'

export default defineComponent(  {
  components: { AppModal, IconPencil, ButtonBase },

  setup( ) {
    const { allLangs } = useLangStore()

    const { fetchWordList, removePair, updatePair: updatePairApi } = useWordListStore()
    fetchWordList()

    const { list } = storeToRefs(useWordListStore())
    const { userInfo } = storeToRefs(useUserDataStore())

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
      if(pair) editPair.value = cloneDeep(pair)
      isEditOpened.value = true
    }

    function closeEdit() {
      editPair.value = undefined
      isEditOpened.value = false
    }

    return {
      allLangs,
      wordList: list,
      remove,
      isEditOpened,
      openEdit,
      closeEdit,
      editPair,
      updatePair,
      userInfo
    }
  }
})
</script>

<template>
  <div class="words-list-wrap">
    <div v-if="!wordList.length">
      <h2 class="text-center">{{ $t('wordListStub') }}</h2>
    </div>
    <TransitionGroup v-else name="word-list" class="word-list" tag="ul">
      <li class="words-list__item" v-for="item in wordList" :key="item.id">
        <p class="words-list__text">{{ item[userInfo.settings.columnOrder[0]].value }}</p>
        <small class="words-list__lang">{{ item[userInfo.settings.columnOrder[0]].lang }}</small>
        <div class="separator"></div>
        <p class="words-list__text">{{ item[userInfo.settings.columnOrder[1]].value }}</p>
        <small class="words-list__lang">{{ item[userInfo.settings.columnOrder[1]].lang }}</small>
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
        <div class="edit-modal d-flex flex-column" v-if="editPair">
          <label for="origin">
            {{ $t('origin') }}
          </label>
          <div class="edit-modal__row">
            <textarea class="textarea-base" id="origin" v-model="editPair.origin.value"></textarea>
            <select class="base-select" v-model="editPair.origin.lang">
              <option v-for="lang in allLangs" :key="lang">{{ lang }}</option>
            </select>
          </div>
          <label for="translation">
            {{ $t('translation') }}
          </label>
          <div class="edit-modal__row">
            <textarea class="textarea-base" id="translation" v-model="editPair.translation.value"></textarea>
            <select class="base-select" v-model="editPair.translation.lang">
              <option v-for="lang in allLangs" :key="lang">{{ lang }}</option>
            </select>
          </div>
          <button-base class="save-edit-btn" @click="updatePair">Save</button-base>
        </div>
      </AppModal>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
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

  &__lang {
    display: flex;
    align-items: center;
    width: 2rem;
    color: var(--main-contrast-lighter);
    margin-right: calc(var(--space) * 2);
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
    display: grid;
    grid-template-columns: 1fr 6.5rem;
    gap: calc(var(--space) * 3);
    margin-bottom: 2rem;
    align-items: start;
  }
}

.save-edit-btn {
  height: 4rem;
  margin-top: auto;
  flex-shrink: 0;
}
</style>
