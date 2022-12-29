<script lang="ts" setup>
import WordsList from '@/components/WordsList.vue'
import AddPair from '@/components/AddPair.vue'
</script>

<template>
  <main class="word-list container">
    <words-list class="word-table under-header" />
    <add-pair class="add-pair pb-3" />
  </main>
</template>

<style lang="scss" scoped>
@import "@/assets/media.scss";

.add-pair,
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
</style>
