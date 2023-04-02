<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  theme?: 'default' | 'accent',
  vibration?: number
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'default',
  vibration: 15
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

<style lang="scss" scoped>
.button-base {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--main-contrast);
  background-color: var(--c-background);
  border: none;
  border-radius: var(--default-b-radius);
  box-shadow: var(--main-shodow-top);
  outline: none;
  transition: all .1s;

  &__icon {
    fill: red;
  }

  &:active {
    color: var(--main-contrast-hard);
    box-shadow: var(--main-shodow-bottom)
  }

  &:focus-visible {
    outline: 2px solid var(--main-contrast-hard);
    outline-offset: 1px;
  }

  &--accent {
    color: var(--c-accent-contrast);
    background-color: var(--c-accent);

    &:active {
      color: var(--c-accent-contrast);
    }
  }

  &:disabled {
    box-shadow: var(--shodow-disabled);
    opacity: 0.5;
  }
}
</style>
