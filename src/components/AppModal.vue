<template>
  <Transition name="modal" @after-enter="$emit('endAnimation')">
    <div class="app-modal" v-if="show" @click="$emit('close')">
      <div class="app-modal__content" @click.stop>
        <slot></slot>
        <button-base class="close-btn" @click="$emit('close')">X</button-base>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import ButtonBase from './base/BaseButton.vue'

interface Props {
  show: boolean
}

withDefaults(defineProps<Props>(), {
  show: false
})

</script>

<style lang="scss" scoped>
.app-modal {
  display: flex;
  z-index: var(--z-idx-super);
  position: absolute;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,.3);
  transition: opacity 0.3s ease;

  &__content {
    position: absolute;
  }
}

.close-btn {
  position: absolute;
  padding: 0.5rem;
  top: 1rem;
  right: 1rem;
}


.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}
</style>
