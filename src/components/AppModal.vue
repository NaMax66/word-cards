<template>
  <div class="app-modal" :class="{ isOpened }">
    <button-base @click="close">X</button-base>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ButtonBase from './ButtonBase.vue'
import eventBus from '@/services/eventBus'

export default defineComponent({
  components: { ButtonBase },

  setup() {
    const isOpened = ref(true)
    eventBus.on('openModal', () => {
      isOpened.value = true
    })

    function close() {
      isOpened.value = false
    }

    return {
      isOpened,
      close
    }
  }
})
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
  display: none;
}

.app-modal.isOpened {
  display: block;
}
</style>
