import { defineStore } from 'pinia'
import {ref} from 'vue'
import httpClient, {postOptions} from '@/services/httpClient'

export const useUserDataStore = defineStore('user-data', () => {
    const userInfo = ref({
        name: '',
        picture: '',
    })

    function setUserInfo({ name, picture }: { name: string, picture: string }) {
        userInfo.value.name = name
        userInfo.value.picture = picture
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

    const userSettings = ref({})
    function fetchSettings() {
       return httpClient.get('/get-user-settings', { withCredentials: true})
           .then(({ data: { data } }) => {
                userSettings.value = JSON.parse(data.settings)
            }).catch(console.error)
    }

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
        fetchSettings,
        saveSettings
    }
})
