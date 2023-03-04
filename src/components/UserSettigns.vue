<script lang="ts" setup>
import AppModal from '@/components/AppModal.vue'
import {ref} from 'vue'
import httpClient, { postOptions } from '@/services/httpClient'

const isSettingsOpened = ref(false)

async function getSettings() {
  const { data: { data } } = await httpClient.get('/get-user-settings', {
    withCredentials: true
  })
  console.log(data)
}

function saveSettings() {
  const settings = JSON.stringify({ interfaceLang: 'en', columnOrder: ['origin', 'translation'] })
  httpClient.post('/update-user-settings', { settings }, postOptions)
}

function openSettings() {
  isSettingsOpened.value = true
}

function closeSettigns() {
  isSettingsOpened.value = false
}

</script>

<template>
  <div>
    <button @click="openSettings">STNG</button>
    <Teleport to="modals-container">
      <AppModal :show="isSettingsOpened" @close="closeSettigns">
        <div class="user-settings">
          <button @click="getSettings">getSettings</button>
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
