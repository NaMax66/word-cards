<template>
  <div class="app-modal" :class="{ isOpened: props.show }" @click="$emit('close')">
    <div class="app-modal__content" @click.stop>
      <slot></slot>
      <button-base class="close-btn" @click="$emit('close')">X</button-base>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ButtonBase from './ButtonBase.vue'

interface Props {
  show: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})
</script>

<style lang="scss" scoped>
.app-modal {
  z-index: var(--z-idx-super);
  position: absolute;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,.3);
  display: none;

  &__content {
    position: absolute;
  }
}

.app-modal.isOpened {
  display: flex;
}

.close-btn {
  position: absolute;
  padding: 0.5rem;
  top: 1rem;
  right: 1rem;
}
</style>
