<script lang="ts" setup>
import WordsList from '@/components/WordsList.vue'
import AddPair from '@/components/AddPair/AddPair.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import ButtonBase from '@/components/base/BaseButton.vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWordListStore } from '@/stores/word-list'

const { filterPhrase } = storeToRefs(useWordListStore())

const viewType = ref<'add-pair' | 'search'>('add-pair')

function toggleSearch() {
  filterPhrase.value = ''
  viewType.value === 'add-pair' ? viewType.value = 'search' : viewType.value = 'add-pair'
}
</script>

<template>
  <main class="word-list container">
    <words-list class="word-table under-header" />
    <div class="add-pair gap-3">
      <add-pair v-if="viewType === 'add-pair'" class="grow" />
      <input v-else v-model="filterPhrase" class="textarea-base grow" />

      <button-base @click="toggleSearch" class="p-2">
        <icon-search />
      </button-base>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@import "@/assets/media.scss";

.word-list {
  max-width: 800px;
}

.word-list {
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  height: 100vh;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.word-table {
  padding: 12px 8px 112px;

  @include devices-tablet {
    padding-bottom: 165px;
  }
}

.add-pair {
  display: flex;
  position: fixed;
  bottom: 12px;
  padding: 0 calc(var(--space) * 2);
  width: 100%;
  max-width: 800px;
  height: 4rem;
}
</style>
