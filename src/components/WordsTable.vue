<script lang="ts">
import { defineComponent } from 'vue'
import { useWordListStore } from '@/stores/word-list'
import { storeToRefs } from 'pinia'

export default defineComponent({
  setup() {
    const { fetchWordList, removePair } = useWordListStore()
    fetchWordList()

    const { list } = storeToRefs(useWordListStore())

    function remove(pairId: string) {
      removePair(pairId)
    }

    return {
      wordList: list,
      remove
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
    <tr v-for="(pair, index) in wordList" :key="index">
      <td class="body-cell">{{ pair.ru }}</td>
      <td class="body-cell">
        <div class="body-cell-content">
          <span>{{ pair.en }}</span>
          <button class="btn-delete" @click="remove(pair.id)">x</button>
        </div>
      </td>
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
  padding-left: calc(var(--space) * 2);
}

.body-cell {
  width: 50%;
  justify-content: space-between;
  border: 1px solid var(--c-border);
  padding: var(--space) calc(var(--space) * 2);
}

.body-cell-content {
  display: flex;
  justify-content: space-between;
}

.body-cell-content .btn-delete {
  visibility: hidden;
}

.body-cell-content:hover .btn-delete {
  visibility: visible;
}
</style>
