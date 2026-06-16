<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { storeToRefs } from 'pinia'

  import { useMarkerStore } from '@/stores/markers'
  import { useWordListStore } from '@/stores/word-list'
  import { useUserDataStore } from '@/stores/userData'

  import AppModal from '../AppModal.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import ButtonBase from '@/components/base/BaseButton.vue'

  import type { Pair } from '@/types/Pair'
  import type { Order } from '@/types/Settings'
  import type { Option } from '@/components/base/Option'
  import type { LocaleKey } from '@/locales/LocaleKey'

  const { addPair: addPairInStore } = useWordListStore()
  const markerStore = useMarkerStore()
  const { markers, firstMarkerId, secondMarkerId } = storeToRefs(markerStore)
  const { userInfo } = storeToRefs(useUserDataStore())

  const isAddFormShown = ref(false)

  const emit = defineEmits(['added'])

  const markerOptions = computed<Option<string>[]>(() => {
    return markers.value.map((marker, index) => ({
      value: marker.id,
      title: marker.code,
      id: index + 1
    }))
  })

  const originMarkerOption = computed<Option<string>>(() => {
    return markerOptions.value.find(el => el.value === firstMarkerId.value) || {
      value: firstMarkerId.value,
      title: '',
      id: 1
    }
  })

  const translationMarkerOption = computed<Option<string>>(() => {
    return markerOptions.value.find(el => el.value === secondMarkerId.value) || {
      value: secondMarkerId.value,
      title: '',
      id: 2
    }
  })

  interface formItem {
    id: Order,
    label: LocaleKey,
    ref: HTMLTextAreaElement | null
    name: string,
    markerName: string,
    currentOption: Option<string>
  }

  const formItems = computed<formItem[]>(() => [
    {
      id: 'origin',
      label: 'translation side',
      ref: null,
      name: 'originValue',
      markerName: 'originMarkerId',
      currentOption: originMarkerOption.value
    },
    {
      id: 'translation',
      label: 'word side',
      ref: null,
      name: 'translationValue',
      markerName: 'translationMarkerId',
      currentOption: translationMarkerOption.value
    }
  ])

  const orderedItems = computed(() => {
    const order = userInfo.value.settings.fillFormOrder
    if (order.length !== formItems.value.length) throw new Error('wrong form elements count')

    const result = []

    for(let item of order) {
      const el = formItems.value.find(el => el.id === item)
      if(el) result.push(el)
    }

    return result
  })

  const addPair = (e: Event) => {
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const pair: Omit<Pair, 'id'> = {
      origin: {
        markerId: formData.get('originMarkerId') as string,
        value: formData.get('originValue') as string
      },
      translation: {
        markerId: formData.get('translationMarkerId') as string,
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

  async function openAddForm() {
    if (!markerStore.isLoaded) await markerStore.fetchMarkers()
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
              <base-select :name="item.markerName" :options="markerOptions" :current="item.currentOption" />
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
