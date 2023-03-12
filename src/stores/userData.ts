import { defineStore } from 'pinia'
import { ref } from 'vue'
import httpClient, { postOptions } from '@/services/httpClient'

export const useUserDataStore = defineStore('user-data', () => {
    const userInfo = ref({
        name: '',
        picture: '',
        settings: {}
    })

    function setUserInfo({ name, picture, settings }: { name: string, picture: string, settings: string }) {
        userInfo.value.name = name
        userInfo.value.picture = picture
        userInfo.value.settings = JSON.parse(settings)
    }

    function clearUserInfo() {
        userInfo.value.name = ''
        userInfo.value.picture = ''
        userInfo.value.settings = {}
    }

    async function fetchUserInfo() {
        const { data: { data } } = await httpClient.get('/user-data', {
            withCredentials: true
        })

        setUserInfo(data)
    }

    const userSettings = ref({})


    function saveSettings() {
        const settings = { interfaceLang: 'en', columnOrder: ['origin', 'translation'] }
        return httpClient.post('/update-user-settings', { settings: JSON.stringify(settings) }, postOptions)
            .then(({ data }) => {
                if(data.status === 'success') {
                    userSettings.value = settings
                } else {
                    console.error('server error')
                }
            }).catch(console.error)
    }

    return {
        userInfo,
        clearUserInfo,
        fetchUserInfo,

        userSettings,
        saveSettings
    }
})
