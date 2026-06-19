<script lang="ts" setup>
import AppModal from '@/components/AppModal.vue'
import { computed, ref, watch } from 'vue'
import { useUserDataStore } from '@/stores/userData'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import ButtonBase from '@/components/base/BaseButton.vue'
import IconSettings from '@/components/icons/IconSettings.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import type { Order } from '@/types/Settings'
import type { Option } from '@/components/base/Option'
import type { Locale } from '@/types/Locale'
import defaultSettings from '@/defaultData/settings'
import MarkerSettings from '@/components/MarkerSettings.vue'
import { authApi } from '@/services/auth'
import { useMarkerStore } from '@/stores/markers'

const userDataStore = useUserDataStore()
const { saveSettings: saveSettingsStore } = userDataStore
const markerStore = useMarkerStore()
const { userInfo } = storeToRefs(userDataStore)
const { locale, t, availableLocales } = useI18n()

const isSettingsOpened = ref(false)
const isDeletingAccount = ref(false)
const isDeleteConfirmVisible = ref(false)
const deleteConfirmation = ref('')
const appVersion = __APP_VERSION__
const repoUrl = __APP_REPO_URL__
const deleteConfirmationValue = 'DELETE'


watch(
  () => userInfo.value.settings.interfaceLang,
  (lang) => {
    locale.value = lang
  },
  { immediate: true }
)

function openSettings() {
  isSettingsOpened.value = true
}
function closeSettings() {
  isSettingsOpened.value = false
  closeDeleteConfirm()
}

const columnOrderOptions = computed<Option<Order>[]>(() => {
  return [
    {
      id: 1,
      title: t('translation left'),
      value: 'origin'
    },
    {
      id: 2,
      title: t('word left'),
      value: 'translation'
    }
  ]
})
const currentColumnOrder = computed<Option<Order>>(() => {
  return columnOrderOptions.value.find(el => el.value === userInfo.value.settings.columnOrder[0]) as Option<Order>
})

const fillFormOrderOptions = computed<Option<Order>[]>(() => {
  return [
    {
      id: 1,
      title: t('translation on top'),
      value: 'origin'
    },
    {
      id: 2,
      title: t('word on top'),
      value: 'translation'
    }
  ]
})
const currentFillFormOrder = computed<Option<Order>>(() => {
  return fillFormOrderOptions.value.find(el => el.value === userInfo.value.settings.fillFormOrder[0]) as Option<Order>
})

const localeOptions = computed<Option<Locale>[]>(() => {

  return availableLocales.reduce((acc: Option<Locale>[], el: string, index: number) => {
    const opt: Option<Locale> = {
      id: index + 1,
      title: t(el),
      value: el
    }

    acc.push(opt)

    return acc
  }, [])
})
const currentLocale = computed<Option<Locale>>(() => {
  const current = userInfo.value.settings.interfaceLang || defaultSettings.interfaceLang
  return localeOptions.value.find(el => el.value === current) as Option<Locale>
})

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

function openDeleteConfirm() {
  isDeleteConfirmVisible.value = true
  deleteConfirmation.value = ''
}

function closeDeleteConfirm() {
  if (isDeletingAccount.value) return

  isDeleteConfirmVisible.value = false
  deleteConfirmation.value = ''
}

async function deleteAccount() {
  if (deleteConfirmation.value !== deleteConfirmationValue || isDeletingAccount.value) return

  isDeletingAccount.value = true

  try {
    await authApi.deleteAccount()
    userDataStore.clearUserInfo()
    markerStore.clearMarkers()
    window.location.reload()
  } catch (error) {
    console.error('Account deletion failed', error)
    isDeletingAccount.value = false
  }
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
              <label for="column_order" class="setting-header">{{ $t('list order') }}</label>
              <base-select id="column_order" name="column_order" :current="currentColumnOrder" :options="columnOrderOptions" />
            </li>
            <li class="list-item">
              <label for="fill_form_order" class="setting-header">{{ $t('add pair order') }}</label>
              <base-select id="fill_form_order" name="fill_form_order" :current="currentFillFormOrder" :options="fillFormOrderOptions" />
            </li>
            <li class="list-item">
              <label for="language" class="setting-header">{{ $t('interface language') }}</label>
              <base-select id="language" name="language" :current="currentLocale" :options="localeOptions" />
            </li>
            <li class="list-item">
              <label class="setting-header">{{ $t('card markers') }}</label>
              <marker-settings />
            </li>
          </ul>

          <div class="app-info" aria-label="Application information">
            <strong>Word Cards</strong>
            <span>{{ appVersion }}</span>
            <a :href="repoUrl" target="_blank" rel="noreferrer">repo</a>
          </div>

          <div class="danger-zone">
            <button-base class="delete-account-btn" type="button" @click="openDeleteConfirm">
              {{ $t('delete account') }}
            </button-base>
          </div>

          <button-base class="save-btn" type="submit" theme="accent">{{ $t('save') }}</button-base>
        </form>
      </AppModal>
      <AppModal :show="isDeleteConfirmVisible" @close="closeDeleteConfirm">
        <form class="delete-confirm" @submit.prevent="deleteAccount">
          <h2>{{ $t('delete account') }}</h2>
          <p>{{ $t('delete account warning') }}</p>
          <label for="delete-account-confirmation">
            {{ $t('delete account confirmation') }}
          </label>
          <input
            id="delete-account-confirmation"
            v-model="deleteConfirmation"
            autocomplete="off"
            :disabled="isDeletingAccount"
          >
          <div class="delete-confirm-actions">
            <button-base type="button" :disabled="isDeletingAccount" @click="closeDeleteConfirm">
              {{ $t('cancel') }}
            </button-base>
            <button-base
              type="submit"
              theme="accent"
              :disabled="deleteConfirmation !== deleteConfirmationValue || isDeletingAccount"
            >
              {{ isDeletingAccount ? $t('deleting') : $t('delete forever') }}
            </button-base>
          </div>
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
  max-width: 30rem;
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

.app-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0 18px;
  color: var(--main-contrast-light);
  font-size: 0.86rem;
  font-weight: 700;
}

.app-info strong {
  color: var(--main-contrast);
}

.app-info a {
  color: var(--c-accent);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.danger-zone {
  margin-bottom: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--main-contrast-light);
}

.delete-account-btn {
  padding: 10px 14px;
  color: #b42318;
}

.delete-confirm {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(90vw, 28rem);
  padding: 2rem;
  color: var(--main-contrast);
  background: var(--c-background);
  border-radius: var(--default-b-radius);
}

.delete-confirm h2 {
  margin: 0;
  font-size: 1.35rem;
}

.delete-confirm p {
  margin: 0;
  line-height: 1.45;
}

.delete-confirm label {
  font-weight: 700;
}

.delete-confirm input {
  padding: 10px 12px;
  color: var(--main-contrast);
  background: var(--c-background);
  border: 1px solid var(--main-contrast-light);
  border-radius: var(--default-b-radius);
}

.delete-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.delete-confirm-actions button {
  padding: 10px 14px;
}

.list-item {
  margin-bottom: 20px;
}

.setting-header {
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
}
</style>
