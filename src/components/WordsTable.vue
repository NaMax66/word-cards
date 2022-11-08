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
      <th>Ru</th>
      <th>En</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>Яблоко</td>
      <td>{{ $t('test') }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
.word-list {

}
</style>
