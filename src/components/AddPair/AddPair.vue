<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { storeToRefs } from 'pinia'

  import { useLangStore } from '@/stores/languages'
  import { useWordListStore } from '@/stores/word-list'
  import { useUserDataStore } from '@/stores/userData'

  import AppModal from '../AppModal.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import ButtonBase from '@/components/base/BaseButton.vue'

  import type { Pair } from '@/types/Pair'
  import type { Order } from '@/types/Settings'
  import type { Option } from '@/components/base/Option'
  import type { LocaleKey } from '@/locales/LocaleKey'

  const { originLang, translationLang } = useLangStore()
  const { addPair: addPairInStore } = useWordListStore()
  const { allLangs } = useLangStore()
  const { userInfo } = storeToRefs(useUserDataStore())

  const isAddFormShown = ref(false)

  const emit = defineEmits(['added'])

  const langOptions = computed<Option<string>[]>(() => {
    const langs = Object.values(allLangs)
    return langs.reduce((acc: Option<string>[], el: string, index: number) => {
      const opt: Option<string> = {
        value: el,
        title: el,
        id: index + 1
      }
      acc.push(opt)
      return acc
    }, [])
  })

  const originLangOption = computed<Option<string>>(() => {
    return langOptions.value.find(el => el.value === originLang) || {
      value: originLang,
      title: originLang,
      id: 1
    }
  })

  const translationLangOption = computed<Option<string>>(() => {
    return langOptions.value.find(el => el.value === translationLang) || {
      value: translationLang,
      title: translationLang,
      id: 1
    }
  })

  interface formItem {
    id: Order,
    label: LocaleKey,
    ref: HTMLTextAreaElement | null
    name: string,
    langName: string,
    langOptions: Option<string>[],
    currentOption: Option<string>
  }

  const formItems: formItem[] = [
    {
      id: 'origin',
      label: 'your language',
      ref: null,
      name: 'originValue',
      langName: 'originLang',
      langOptions: langOptions.value,
      currentOption: originLangOption.value
    },
    {
      id: 'translation',
      label: 'other language',
      ref: null,
      name: 'translationValue',
      langName: 'translationLang',
      langOptions: langOptions.value,
      currentOption: translationLangOption.value
    }
  ]

  const orderedItems = computed(() => {
    const order = userInfo.value.settings.fillFormOrder
    if (order.length !== formItems.length) throw new Error('wrong form elements count')

    const result = []

    for(let item of order) {
      const el = formItems.find(el => el.id === item)
      if(el) result.push(el)
    }

    return result
  })

  const addPair = (e: Event) => {
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const pair: Omit<Pair, 'id'> = {
      origin: {
        lang: formData.get('originLang') as string,
        value: formData.get('originValue') as string
      },
      translation: {
        lang: formData.get('translationLang') as string,
        value: formData.get('translationValue') as string
      }
    }
    addPairInStore(pair)

    emit('added', pair)

    form.reset()
    closeAddForm()
  }

  // could not work with iphones https://stackoverflow.com/questions/54424729/ios-show-keyboard-on-input-focus
  function focusOnFirstInput() {
    const textarea = orderedItems.value[0]?.ref
    textarea?.focus()
  }

  function openAddForm() {
    isAddFormShown.value = true
  }

  function closeAddForm() {
    isAddFormShown.value = false
  }
</script>

<template>
  <div>
    <button-base @click="openAddForm" class="add-pair-btn" theme="accent">{{ $t('add pair') }}</button-base>
    <Teleport to="modals-container">
      <AppModal :show="isAddFormShown" @close="closeAddForm" @endAnimation="focusOnFirstInput">
        <form class="edit-modal" @submit.prevent="addPair" autocomplete="off">
          <div class="form-item" v-for="item in orderedItems" :key="item.id">
            <label :for="item.id" class="d-block mb-2">
              {{ $t(item.label) }}
            </label>
            <div class="edit-modal__row">
              <!-- ref inside v-for hack -->
              <textarea :ref="//@ts-ignore
                                el => item.ref = el" class="textarea-base" :id="item.id" :name="item.name" required></textarea>
              <base-select :name="item.langName" :options="item.langOptions" :current="item.currentOption" />
            </div>
          </div>
          <button-base class="submit-btn" type="submit" theme="accent">{{ $t('add') }}</button-base>
        </form>
      </AppModal>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/media.scss";

.add-pair-btn {
  height: 100%;
  width: 100%;
}

.submit-btn {
  margin-top: 2rem;
  height: 4rem;
  flex-shrink: 0;
  padding: 0 2.5rem;
}

.form-item {
  &--first {
    grid-row-start: 1;
    grid-row-end: 2;
  }
  &--second {
    grid-row-start: 2;
    grid-row-end: 3;
  }
}

.edit-modal {
  display: grid;
  grid-template-columns: 1fr;
  padding: 3rem 2rem 1.5rem;
  width: 90vw;
  max-width: 50rem;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--c-background);
  border-radius: var(--default-b-radius);

  &__row {
    display: grid;
    grid-template-columns: 1fr 6.5rem;
    gap: calc(var(--space) * 3);
    margin-bottom: 2rem;
    align-items: start;
  }
}
</style>
