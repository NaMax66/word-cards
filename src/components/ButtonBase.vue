<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  theme: 'default' | 'accent',
  vibration: number
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'default',
  vibration: 30
})
const theme = ref(props.theme)
const vibration = (e: Event) => {
  if(props.vibration) window?.navigator?.vibrate(props.vibration)
  return e
}

</script>

<template>
  <button @click="vibration" class="button-base" :class="`button-base--${theme}`">
    <slot></slot>
  </button>
</template>

<style scoped>
.button-base {
  color: var(--main-contrast);
  background-color: var(--c-background);
  border: none;
  border-radius: var(--default-b-radius);
  box-shadow: var(--main-shodow-top);
  outline: none;
  transition: all .1s;
}
.button-base.button-base--accent {
  color: var(--c-accent-contrast);
  background-color: var(--c-accent);
}

.button-base.button-base--accent:active {
  color: var(--c-accent-contrast);
}


.button-base:active {
  color: var(--main-contrast-hard);
  box-shadow: var(--main-shodow-bottom)
}
</style>
