<template>
  <select class="base-select">
    <option v-for="option in options" :value="option.value" :key="option.id" :selected="option.id === current.id">
      {{ option.title }}
    </option>
  </select>
</template>

<script lang="ts" setup>
import type { Option } from '@/components/base/Option'

defineProps<{
  options: Option<any>[],
  current: Option<any>
}>()
</script>

<style lang="scss" scoped>
.base-select {
  border: none;
  outline: none;
  background: var(--c-background);
  padding: 8px 12px;
  box-shadow: var(--main-shodow-top);
  border-radius: var(--default-b-radius);
  font-size: var(--fs-main);

  &:active {
    color: var(--main-contrast-hard);
    box-shadow: var(--main-shodow-bottom)
  }

  &:focus-visible {
    outline: 2px solid var(--main-contrast-hard);
    outline-offset: 1px;
  }
}
</style>
