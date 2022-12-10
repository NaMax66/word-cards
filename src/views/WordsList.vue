<script lang="ts" setup>
import WordsTable from '@/components/WordsTable.vue'
import AddPair from '@/components/AddPair.vue'
</script>

<template>
  <main class="word-list">
    <words-table class="word-table" />
    <add-pair class="pb-3" />
  </main>
</template>

<style scoped>
.word-list {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.word-table {
  padding-top: 12px;
  width: 100%;
  padding-bottom: 112px;
}
@media (max-width: 800px) {
  .word-table {
    padding-bottom: 165px;
  }
}
</style>
