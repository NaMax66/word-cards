<script lang="ts" setup>
import AppModal from '@/components/AppModal.vue'
import { ref, watch } from 'vue'
import { useUserDataStore } from '@/stores/userData'
import { storeToRefs } from 'pinia'
import ButtonBase from '@/components/ButtonBase.vue'
import IconSettings from '@/components/icons/IconSettings.vue'
import { useI18n } from 'vue-i18n'
import type { Order } from '@/types/Settings'

const { saveSettings: saveSettingsStore } = useUserDataStore()
const { userInfo } = storeToRefs(useUserDataStore())
const { locale } = useI18n()

const isSettingsOpened = ref(false)

function saveSettings(e: Event) {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)
  const columnOrder = formData.get('column_order') as Order
  const fillFormOrder = formData.get('fill_form_order') as Order
  const language = formData.get('language') as string

  saveSettingsStore({
    columnOrder: [columnOrder, ...userInfo.value.settings.columnOrder.filter(el => el !== columnOrder)],
    fillFormOrder: [fillFormOrder, ...userInfo.value.settings.fillFormOrder.filter(el => el !== fillFormOrder)],
    interfaceLang: language
  })

  closeSettings()
}

watch(userInfo.value, (a) => {
  updateInterfaceLang(a.settings.interfaceLang)
})
function updateInterfaceLang(lang: string) {
  locale.value = lang
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
            <li class="list-item">
              <h3 class="mb-2">{{ $t('add pair order') }}</h3>
              <label>
                <span>{{ $t('your language on top') }}</span>
                <input class="ml-2" name="fill_form_order" type="radio" value="origin" :checked="userInfo.settings.fillFormOrder[0] === 'origin'">
              </label>
              <label class="ml-3">
                <span>{{ $t('other language on top') }}</span>
                <input class="ml-2" name="fill_form_order" type="radio" value="translation" :checked="userInfo.settings.fillFormOrder[0] === 'translation'">
              </label>
            </li>
            <li class="list-item">
              <h3 class="mb-2 d-block">{{ $t('interface language') }}</h3>
              <div class="d-flex align-center gap-2">
                <label class="d-flex align-center" v-for="locale in $i18n.availableLocales" :key="locale">
                  <span>{{ $t(locale) }}</span>
                  <input class="ml-2" name="language" type="radio" :value="locale" :checked="userInfo.settings.interfaceLang === locale">
                </label>
              </div>
            </li>
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

.user-settings input {
  transform: translateY(2px);
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
