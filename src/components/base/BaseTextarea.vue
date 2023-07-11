<script setup lang="ts">
console.log('test')
</script>

<template>
  <textarea class="textarea-base" />
</template>

<style scoped lang="scss">
.textarea-base {
  border: none;
  outline: none;
  background: none;
  padding: 8px 12px;
  box-shadow: var(--main-shodow-inside);
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
