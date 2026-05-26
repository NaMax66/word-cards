import { defineStore } from 'pinia'
import { ref } from 'vue'
import httpClient, { postOptions } from '@/services/httpClient'
import type { Settings } from '@/types/Settings'
import { createDefaultSettings } from '@/defaultData/settings'

type UserInfoPayload = {
    name: string | null
    picture: string | null
    settings: string | null
}

export const useUserDataStore = defineStore('user-data', () => {
    const userInfo = ref({
        name: '',
        picture: '',
        settings: createDefaultSettings()
    })

    function setUserInfo({ name, picture, settings }: UserInfoPayload) {
        userInfo.value.name = name || ''
        userInfo.value.picture = picture || ''

        userInfo.value.settings = settings
            ? normalizeSettings(JSON.parse(settings))
            : createDefaultSettings()

        return Boolean(settings)
    }

    function clearUserInfo() {
        userInfo.value.name = ''
        userInfo.value.picture = ''
        userInfo.value.settings = createDefaultSettings()
    }

    async function fetchUserInfo() {
        const { data: { data } } = await httpClient.get('/user-data', {
            withCredentials: true
        })

        const hasSavedSettings = setUserInfo(data)

        if (!hasSavedSettings) {
            await saveSettings(userInfo.value.settings)
        }
    }

    function saveSettings(settings: Settings) {
        return httpClient.post('/update-user-settings', { settings: JSON.stringify(settings) }, postOptions)
            .then(({ data }) => {
                if(data.status === 'success') {
                    userInfo.value.settings = settings
                } else {
                    console.error('server error')
                }
            }).catch(console.error)
    }

    return {
        userInfo,
        clearUserInfo,
        fetchUserInfo,
        saveSettings
    }
})

function normalizeSettings(settings: Partial<Settings>): Settings {
    const defaults = createDefaultSettings()

    return {
        interfaceLang: settings.interfaceLang || defaults.interfaceLang,
        columnOrder: settings.columnOrder || defaults.columnOrder,
        fillFormOrder: settings.fillFormOrder || defaults.fillFormOrder
    }
}
