<script lang="ts" setup>
import { computed, ref } from 'vue'
  import { useLangStore } from '@/stores/languages'
  import { useWordListStore } from '@/stores/word-list'
  import ButtonBase from '@/components/base/BaseButton.vue'
  import AppModal from './AppModal.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'

  import type { Pair } from '@/types/Pair'
  import type { Order } from '@/types/Settings'
  import { storeToRefs } from 'pinia'
  import { useUserDataStore } from '@/stores/userData'
  import type { Option } from '@/components/base/Option'

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

  function openAddForm() {
    isAddFormShown.value = true
  }

  function closeAddForm() {
    isAddFormShown.value = false
  }

  function getOrderClass(order: Order) {
    const orderArr = userInfo.value.settings.fillFormOrder
    const end = orderArr[0] === order ? 'first' : 'second'

    return 'form-item--' + end
  }
</script>

<template>
  <div class="add-pair">
    <button-base @click="openAddForm" class="add-pair-btn" theme="accent">{{ $t('add pair') }}</button-base>
    <Teleport to="modals-container">
      <AppModal :show="isAddFormShown" @close="closeAddForm">
        <form class="edit-modal" @submit.prevent="addPair" autocomplete="off">
          <div class="form-item" :class="getOrderClass('origin')">
            <label for="origin" class="d-block mb-2">
              {{ $t('your language') }}
            </label>
            <div class="edit-modal__row">
              <textarea class="textarea-base" id="origin" name="originValue"></textarea>
              <base-select name="originLang" :options="langOptions" :current="originLangOption" />
            </div>
          </div>
          <div class="form-item" :class="getOrderClass('translation')">
            <label for="translation" class="d-block mb-2">
              {{ $t('other language') }}
            </label>
            <div class="edit-modal__row">
              <textarea class="textarea-base" id="translation" name="translationValue"></textarea>
              <base-select name="translationLang" :options="langOptions" :current="translationLangOption" />
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
