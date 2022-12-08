<script lang="ts">
import { defineComponent } from 'vue'
import { useWordListStore } from '@/stores/word-list'
import { storeToRefs } from 'pinia'
import ButtonBase from '@/components/ButtonBase.vue'

export default defineComponent({
  components: { ButtonBase },
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
    <tbody>
      <tr class="table-line" v-for="(pair, index) in wordList" :key="index">
        <td class="body-cell">{{ pair.en }}</td>
        <div class="separator"></div>
        <td class="body-cell">
          <div class="body-cell-content">
            <span>{{ pair.ru }}</span>
            <button-base class="btn-delete" @click="remove(pair.id)">
              x
            </button-base>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.word-table {
  border-collapse: separate;
  border-spacing: 0 12px;
  max-width: 800px;
}

.header-cell {
  padding-left: calc(var(--space) * 2);
}

.body-cell {
  width: 50%;
  justify-content: space-between;
  padding: var(--space) calc(var(--space) * 2);
}

.body-cell:first-child {
  border-top-left-radius: var(--default-b-radius);
  border-bottom-left-radius: var(--default-b-radius);
}
.body-cell:last-child {
  border-bottom-right-radius: var(--default-b-radius);
  border-top-right-radius: var(--default-b-radius);
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

.table-line {
  background-color: var(--main-color);
  box-shadow: var(--main-shodow-bottom);
  border-radius: var(--default-b-radius);
  margin-bottom: 12px;
  padding: 4px 8px;
  display: flex;
}

.separator {
  width: 2px;
  background-color: var(--c-accent);
}
</style>
