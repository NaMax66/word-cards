<template>
  <div class="app-modal">
    <button-base class="close-btn" @click="$emit('close')">X</button-base>
  </div>
</template>

<script lang="ts" setup>
import ButtonBase from './ButtonBase.vue'
</script>

<style scoped>
.app-modal {
  z-index: var(--z-idx-super);
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,.3);
}

.close-btn {
  top: 2rem;
  right: 2rem;
}
</style>
