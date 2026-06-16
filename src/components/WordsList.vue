<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import cloneDeep from 'lodash.clonedeep'

import ButtonBase from '@/components/base/BaseButton.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import AppModal from '@/components/AppModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import type { Pair } from '@/types/Pair'
import type { Option } from '@/components/base/Option'
import { useWordListStore } from '@/stores/word-list'
import { useUserDataStore } from '@/stores/userData'
import { useMarkerStore } from '@/stores/markers'

const wordListStore = useWordListStore()
const markerStore = useMarkerStore()
const { fetchWordList, removePair, updatePair: updatePairApi } = wordListStore
const { filteredList, hasMore, isLoading } = storeToRefs(wordListStore)
const { userInfo } = storeToRefs(useUserDataStore())
const { markers } = storeToRefs(markerStore)

fetchWordList()
markerStore.fetchMarkers()

const isEditOpened = ref(false)
const editPair = ref<Pair>()

const markerOptions = computed<Option<string>[]>(() => markers.value.map((marker, index) => ({
  value: marker.id,
  title: marker.code,
  id: index + 1
})))

const originMarkerOption = computed(() => currentMarkerOption(editPair.value?.origin.markerId))
const translationMarkerOption = computed(() => currentMarkerOption(editPair.value?.translation.markerId))

function currentMarkerOption(markerId?: string): Option<string> {
  return markerOptions.value.find(option => option.value === markerId) || {
    value: markerId || '',
    title: '',
    id: 0
  }
}

function markerTitle(markerId: string, fallback?: string) {
  return markerStore.markerTitle(markerId, fallback)
}

async function updatePair() {
  if (!editPair.value) return
  await updatePairApi(editPair.value)
  closeEdit()
}

function loadMore() {
  fetchWordList({ reset: false })
}

function openEdit(pairId: string | number) {
  const pair = filteredList.value.find(item => item.id === pairId)
  if (pair) editPair.value = cloneDeep(pair)
  isEditOpened.value = true
}

function closeEdit() {
  editPair.value = undefined
  isEditOpened.value = false
}

function setOriginMarker({ target }: { target: HTMLSelectElement }) {
  if (editPair.value) editPair.value.origin.markerId = target.value
}

function setTranslationMarker({ target }: { target: HTMLSelectElement }) {
  if (editPair.value) editPair.value.translation.markerId = target.value
}
</script>

<template>
  <div class="words-list-wrap">
    <div v-if="!filteredList.length && !isLoading">
      <h2 class="text-center">{{ $t('wordListStub') }}</h2>
    </div>
    <button-base v-if="filteredList.length && hasMore" class="load-more" :disabled="isLoading" @click="loadMore">
      {{ isLoading ? 'Loading...' : 'Load more' }}
    </button-base>
    <ul v-if="filteredList.length" class="word-list">
      <li class="words-list__item" v-for="item in filteredList" :key="item.id">
        <p class="words-list__text">{{ item[userInfo.settings.columnOrder[0]].value }}</p>
        <small class="words-list__lang">
          {{ markerTitle(item[userInfo.settings.columnOrder[0]].markerId, item[userInfo.settings.columnOrder[0]].lang) }}
        </small>
        <div class="separator"></div>
        <p class="words-list__text">{{ item[userInfo.settings.columnOrder[1]].value }}</p>
        <small class="words-list__lang">
          {{ markerTitle(item[userInfo.settings.columnOrder[1]].markerId, item[userInfo.settings.columnOrder[1]].lang) }}
        </small>
        <div class="hidden-controls">
          <button-base class="hidden-controls__btn" @click="openEdit(item.id)">
            <icon-pencil class="hidden-controls__icon" />
          </button-base>
          <button-base class="hidden-controls__btn" @click="removePair(item.id)">x</button-base>
        </div>
      </li>
    </ul>
    <Teleport to="modals-container">
      <AppModal :show="isEditOpened" @close="closeEdit">
        <div class="edit-modal d-flex flex-column" v-if="editPair">
          <label for="origin">{{ $t('translation side') }}</label>
          <div class="edit-modal__row">
            <textarea class="textarea-base" id="origin" v-model="editPair.origin.value"></textarea>
            <base-select :current="originMarkerOption" :options="markerOptions" @input="setOriginMarker" />
          </div>
          <label for="translation">{{ $t('word side') }}</label>
          <div class="edit-modal__row">
            <textarea class="textarea-base" id="translation" v-model="editPair.translation.value"></textarea>
            <base-select :current="translationMarkerOption" :options="markerOptions" @input="setTranslationMarker" />
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
    position: relative;
    display: flex;
    background-color: var(--main-color);
    box-shadow: var(--main-shodow-bottom);
    border-radius: var(--default-b-radius);
    margin-bottom: 12px;
    padding: 4px 8px;

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
  }

  &__lang {
    display: flex;
    align-items: center;
    max-width: 7rem;
    color: var(--main-contrast-lighter);
    margin-right: calc(var(--space) * 2);
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.load-more {
  width: 100%;
  height: 4rem;
  margin-bottom: 12px;
}

.separator {
  width: 2px;
  background-color: var(--c-accent);
}

.hidden-controls {
  position: absolute;
  right: calc(var(--space) * 2);
  top: 50%;
  transform: translateY(-50%);
  visibility: hidden;
  opacity: 0;
  display: flex;
  gap: 8px;

  &__btn {
    width: 22px;
    height: 22px;
  }

  &__icon {
    width: 18px;
    height: 18px;
  }
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
    grid-template-columns: 1fr minmax(8rem, 12rem);
    gap: calc(var(--space) * 3);
    margin-bottom: 2rem;
    align-items: start;
  }
}

.save-edit-btn {
  height: 4rem;
  margin-top: auto;
}
</style>
