<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  setup() {
    return {

    }
  }
})
</script>

<template>
  <table class='word-list'>
    <thead>
    <tr>
      <th class="header-cell">Ru</th>
      <th class="header-cell">En</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td class="body-cell">Яблоко</td>
      <td class="body-cell">{{ $t('test') }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
.word-list {

}
</style>
