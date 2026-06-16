<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'

import AppModal from '@/components/AppModal.vue'
import ButtonBase from '@/components/base/BaseButton.vue'
import { useMarkerStore } from '@/stores/markers'

const markerStore = useMarkerStore()
const { markers, isLoading } = storeToRefs(markerStore)
const isOpened = ref(false)
const newCode = ref('')
const newDescription = ref('')
const errorMessage = ref('')

const canDeleteMarkers = computed(() => markers.value.length > 2)

async function open() {
  errorMessage.value = ''
  await markerStore.fetchMarkers()
  isOpened.value = true
}

function close() {
  isOpened.value = false
  errorMessage.value = ''
}

async function addMarker() {
  const code = newCode.value.trim()
  if (!code) return

  await runAction(async () => {
    await markerStore.createMarker(code, newDescription.value)
    newCode.value = ''
    newDescription.value = ''
  })
}

async function saveMarker(id: string, field: 'code' | 'description', event: Event) {
  const value = (event.target as HTMLInputElement).value
  const marker = markers.value.find(item => item.id === id)
  if (!marker) return

  const code = field === 'code' ? value.trim() : marker.code
  const description = field === 'description' ? value : marker.description || ''

  if (!code) return
  if (code === marker.code && description.trim() === (marker.description || '')) return

  await runAction(() => markerStore.updateMarker(id, code, description))
}

async function removeMarker(id: string) {
  await runAction(() => markerStore.deleteMarker(id))
}

async function moveMarker(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= markers.value.length) return

  const ids = markers.value.map(marker => marker.id)
  ;[ids[index], ids[target]] = [ids[target], ids[index]]
  await runAction(() => markerStore.reorderMarkers(ids))
}

async function runAction(action: () => Promise<void>) {
  errorMessage.value = ''

  try {
    await action()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const code = error.response?.data?.error
      if (code === 'marker_in_use') {
        errorMessage.value = 'marker is used'
        return
      }
      if (code === 'minimum_markers') {
        errorMessage.value = 'minimum two markers'
        return
      }
    }

    errorMessage.value = 'marker operation failed'
  }
}
</script>

<template>
  <button-base type="button" class="open-btn" @click="open">
    {{ $t('manage markers') }}
  </button-base>

  <Teleport to="modals-container">
    <AppModal :show="isOpened" @close="close">
      <section class="marker-settings">
        <h2>{{ $t('markers') }}</h2>
        <p class="description">{{ $t('markers description') }}</p>

        <ul class="marker-list">
          <li v-for="(marker, index) in markers" :key="marker.id" class="marker-row">
            <div class="marker-fields">
              <input
                class="textarea-base marker-code"
                :value="marker.code"
                maxlength="4"
                :aria-label="$t('marker code')"
                required
                @change="saveMarker(marker.id, 'code', $event)"
              />
              <input
                class="textarea-base marker-description"
                :value="marker.description || ''"
                maxlength="100"
                :placeholder="$t('marker description')"
                :aria-label="$t('marker description')"
                @change="saveMarker(marker.id, 'description', $event)"
              />
            </div>

            <span class="usage" :class="{ 'usage--empty': marker.usageCount === 0 }">
              {{ marker.usageCount ? `${marker.usageCount} ${$t('cards')}` : $t('not used') }}
            </span>

            <div class="row-controls">
              <button-base type="button" class="small-btn" :disabled="index === 0 || isLoading" :title="$t('move up')" @click="moveMarker(index, -1)">↑</button-base>
              <button-base type="button" class="small-btn" :disabled="index === markers.length - 1 || isLoading" :title="$t('move down')" @click="moveMarker(index, 1)">↓</button-base>
              <button-base
                type="button"
                class="small-btn delete-btn"
                :disabled="!canDeleteMarkers || marker.usageCount > 0 || isLoading"
                :title="marker.usageCount > 0 ? $t('marker is used') : $t('delete')"
                @click="removeMarker(marker.id)"
              >×</button-base>
            </div>
          </li>
        </ul>

        <form class="add-marker" @submit.prevent="addMarker">
          <input v-model="newCode" class="textarea-base marker-code" maxlength="4" :placeholder="$t('marker code')" required />
          <input v-model="newDescription" class="textarea-base" maxlength="100" :placeholder="$t('marker description')" />
          <button-base type="submit" theme="accent" :disabled="isLoading">{{ $t('add') }}</button-base>
        </form>

        <p v-if="errorMessage" class="error">{{ $t(errorMessage) }}</p>
      </section>
    </AppModal>
  </Teleport>
</template>

<style lang="scss" scoped>
.open-btn {
  width: 100%;
  min-height: 3rem;
  padding: 8px 12px;
}

.marker-settings {
  width: min(92vw, 43rem);
  max-height: 80vh;
  overflow-y: auto;
  padding: 2rem;
  background: var(--c-background);
  border-radius: var(--default-b-radius);
}

.description {
  margin: 8px 0 20px;
  color: var(--main-contrast-light);
}

.marker-list {
  display: grid;
  gap: 10px;
  list-style: none;
}

.marker-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
}

.marker-fields {
  display: grid;
  grid-template-columns: 6rem minmax(8rem, 1fr);
  gap: 8px;
  min-width: 0;
}

.marker-code {
  width: 6rem;
  text-align: center;
}

.marker-description {
  min-width: 0;
}

.usage {
  padding: 4px 8px;
  color: var(--c-accent);
  white-space: nowrap;

  &--empty {
    color: var(--main-contrast-lighter);
  }
}

.row-controls {
  display: flex;
  gap: 6px;
}

.small-btn {
  width: 2.2rem;
  height: 2.2rem;
}

.delete-btn:not(:disabled) {
  color: #b33;
}

.add-marker {
  display: grid;
  grid-template-columns: 6rem 1fr auto;
  gap: 10px;
  margin-top: 20px;

  button {
    padding: 0 18px;
  }
}

.error {
  margin-top: 12px;
  color: #b33;
}

@media (max-width: 600px) {
  .marker-row {
    grid-template-columns: 1fr auto;
  }

  .marker-fields {
    grid-template-columns: 6rem 1fr;
  }

  .usage {
    grid-column: 1;
    grid-row: 2;
  }

  .row-controls {
    grid-column: 2;
    grid-row: 1 / span 2;
  }
}
</style>
