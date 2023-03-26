<script lang="ts" setup>
import AppModal from '@/components/AppModal.vue'
import { ref } from 'vue'
import { useUserDataStore } from '@/stores/userData'
import { storeToRefs } from 'pinia'
import settings from '@/defaultData/settings'
import ButtonBase from '@/components/ButtonBase.vue'
import IconSettings from '@/components/icons/IconSettings.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'

const { saveSettings: saveSettingsStore } = useUserDataStore()
const { userInfo } = storeToRefs(useUserDataStore())

const isSettingsOpened = ref(false)

function saveSettings(e: Event) {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)
  const selection = formData.get('column_order') as 'origin' | 'translation'
  saveSettingsStore({ ...settings, columnOrder: [selection, ...settings.columnOrder.filter(el => el !== selection)] })
  closeSettings()
}

function openSettings() {
  isSettingsOpened.value = true
}

function closeSettings() {
  isSettingsOpened.value = false
}

</script>

<template>
  <div>
    <button-base class="trigger-btn" @click="openSettings">
      <icon-settings />
    </button-base>
    <Teleport to="modals-container">
      <AppModal :show="isSettingsOpened" @close="closeSettings">
        <form @submit="saveSettings" class="user-settings">
          <ul class="settings-list">
            <li class="list-item">
                <h3 class="mb-2">{{ $t('list order') }}</h3>
              <label>
                <span>{{ $t('your language left') }}</span>
                <input class="ml-2" name="column_order" type="radio" value="origin" :checked="userInfo.settings.columnOrder[0] === 'origin'">
              </label>
              <label class="ml-3">
                <span>{{ $t('other language left') }}</span>
                <input class="ml-2" name="column_order" type="radio" value="translation" :checked="userInfo.settings.columnOrder[0] === 'translation'">
              </label>
            </li>
            <!-- todo set lang from settings -->
            <!-- <li class="list-item">
              <h3 class="mb-2 d-block">{{ $t('interface language') }}</h3>
              <lang-switcher />
            </li>-->
          </ul>
          <button-base class="save-btn" type="submit" theme="accent">{{ $t('save') }}</button-base>
        </form>
      </AppModal>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.user-settings {
  display: flex;
  flex-direction: column;
  padding: 3rem 2rem 1.5rem;
  width: 90vw;
  max-width: 50rem;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--c-background);
  border-radius: var(--default-b-radius);
}

.settings-list {
  list-style: none;
  margin: 0;
}

.trigger-btn {
  width: 40px;
  height: 40px;
  padding: 4px;
}

.save-btn {
  padding: 12px 16px;
  align-self: flex-end;
}

.list-item {
  margin-bottom: 20px;
}
</style>
