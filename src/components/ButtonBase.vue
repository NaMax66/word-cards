<script lang="ts" setup>
</script>

<template>
  <button class="button-base">
    <slot></slot>
  </button>
</template>

<style scoped>
.button-base {
  color: var(--main-contrast);
  background: none;
  border: none;
  border-radius: var(--default-b-radius);
  box-shadow: var(--main-shodow-top);
  outline: none;
  transition: all .1s;
}

.button-base:active {
  color: var(--main-contrast-hard);
  box-shadow: var(--main-shodow-bottom)
}
</style>
