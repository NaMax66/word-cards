import { defineStore } from 'pinia'
import { ref } from 'vue'
import httpClient, { postOptions } from '@/services/httpClient'
import type { Settings } from '@/types/Settings'
import defaultSettings from '@/defaultData/settings'

export const useUserDataStore = defineStore('user-data', () => {
    const userInfo = ref({
        name: '',
        picture: '',
        settings: defaultSettings
    })

    function setUserInfo({ name, picture, settings }: { name: string, picture: string, settings: string }) {
        userInfo.value.name = name
        userInfo.value.picture = picture

        if(settings) {
            userInfo.value.settings = JSON.parse(settings)
        }
    }

    function clearUserInfo() {
        userInfo.value.name = ''
        userInfo.value.picture = ''
    }

    async function fetchUserInfo() {
        const { data: { data } } = await httpClient.get('/user-data', {
            withCredentials: true
        })

        setUserInfo(data)
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
