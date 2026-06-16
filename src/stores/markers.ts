import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import httpClient, { postOptions } from '@/services/httpClient'
import type { Marker } from '@/types/Marker'
import checkIsSignedIn from '@/services/checkIsSignedIn'

export const useMarkerStore = defineStore('markers', () => {
  const markers = ref<Marker[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)

  const firstMarkerId = computed(() => markers.value[0]?.id || '')
  const secondMarkerId = computed(() => markers.value[1]?.id || firstMarkerId.value)

  async function fetchMarkers() {
    if (!checkIsSignedIn()) return
    if (isLoading.value) return

    isLoading.value = true
    try {
      const { data: { data } } = await httpClient.get('/markers')
      markers.value = data
      isLoaded.value = true
    } finally {
      isLoading.value = false
    }
  }

  async function createMarker(code: string, description: string) {
    await httpClient.post('/markers', { code, description }, postOptions)
    await fetchMarkers()
  }

  async function updateMarker(id: string, code: string, description: string) {
    await httpClient.patch(`/markers/${encodeURIComponent(id)}`, {
      code,
      description
    }, postOptions)
    await fetchMarkers()
  }

  async function deleteMarker(id: string) {
    await httpClient.delete(`/markers/${encodeURIComponent(id)}`)
    await fetchMarkers()
  }

  async function reorderMarkers(markerIds: string[]) {
    await httpClient.post('/markers/reorder', {
      marker_ids: markerIds.join(',')
    }, postOptions)
    await fetchMarkers()
  }

  function markerTitle(id: string, fallback = '') {
    return markers.value.find(marker => marker.id === id)?.code || fallback
  }

  function clearMarkers() {
    markers.value = []
    isLoaded.value = false
  }

  return {
    markers,
    isLoading,
    isLoaded,
    firstMarkerId,
    secondMarkerId,
    fetchMarkers,
    createMarker,
    updateMarker,
    deleteMarker,
    reorderMarkers,
    markerTitle,
    clearMarkers
  }
})
