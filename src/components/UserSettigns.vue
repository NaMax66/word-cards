<script lang="ts" setup>
import AppModal from '@/components/AppModal.vue'
import {ref } from 'vue'
import { useUserDataStore } from '@/stores/userData'
import { storeToRefs } from 'pinia'


const { saveSettings } = useUserDataStore()
const { userInfo } = storeToRefs(useUserDataStore())

const isSettingsOpened = ref(false)

function openSettings() {
  isSettingsOpened.value = true
}

function closeSettings() {
  isSettingsOpened.value = false
}

</script>

<template>
  <div>
    <button @click="openSettings">STNG</button>
    <Teleport to="modals-container">
      <AppModal :show="isSettingsOpened" @close="closeSettings">
        <div class="user-settings">
          <ul>
            <li v-for="(item, i) in userInfo.settings" :key="i">
              {{ item }}
            </li>
          </ul>
          <button @click="saveSettings">saveSettings</button>
        </div>
      </AppModal>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.user-settings {
  padding: 3rem 2rem 1.5rem;
  width: 90vw;
  max-width: 50rem;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--c-background);
  border-radius: var(--default-b-radius);
}
</style>
