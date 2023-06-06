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

const { saveSettings: saveSettingsStore } = useUserDataStore()
const { userInfo } = storeToRefs(useUserDataStore())
const { locale, t, availableLocales } = useI18n()

const isSettingsOpened = ref(false)



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

const columnOrderOptions = computed<Option<Order>[]>(() => {
  return [
    {
      id: 1,
      title: t('your language left'),
      value: 'origin'
    },
    {
      id: 2,
      title: t('other language left'),
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
      title: t('your language on top'),
      value: 'origin'
    },
    {
      id: 2,
      title: t('other language on top'),
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

.list-item {
  margin-bottom: 20px;
}

.setting-header {
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
}
</style>
