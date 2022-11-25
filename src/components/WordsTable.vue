<script lang="ts">
import { defineComponent } from 'vue'
import { useWordListStore } from '@/stores/word-list'
import { storeToRefs } from 'pinia'

export default defineComponent({
  setup() {
    const { fetchWordList } = useWordListStore()
    fetchWordList()

    const { list } = storeToRefs(useWordListStore())

    return {
      wordList: list
    }
  }
})
</script>

<template>
  <table class='word-table'>
    <thead>
    <tr>
      <th class="header-cell">Ru</th>
      <th class="header-cell">En</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(bond, index) in wordList" :key="index">
      <td class="body-cell">{{ bond.ru }}</td>
      <td class="body-cell">{{ bond.en }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
.word-table {
  border-spacing:0;
  border-collapse: collapse;
}

.header-cell {
  text-align: left;
  padding-left: calc(var(--space) * 2);
}

.body-cell {
  text-align: left;
  border: 1px solid var(--c-border);
  padding: var(--space) calc(var(--space) * 2);
}
</style>
