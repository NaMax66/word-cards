<script lang="ts" setup>
import WordsTable from '@/components/WordsList.vue'
import AddPair from '@/components/AddPair.vue'
</script>

<template>
  <main class="word-list container">
    <words-table class="word-table under-header" />
    <add-pair class="pb-3" />
  </main>
</template>

<style lang="scss" scoped>
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
}
@media (max-width: 800px) {
  .word-table {
    padding-bottom: 165px;
  }
}
</style>
