<script lang="ts" setup>
import WordsList from '@/components/WordsList.vue'
import AddPair from '@/components/AddPair/AddPair.vue'
</script>

<template>
  <main class="word-list container">
    <words-list class="word-table under-header" />
    <add-pair class="add-pair" />
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
