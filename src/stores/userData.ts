import { defineStore } from 'pinia'
import {ref} from 'vue'
import httpClient from '@/services/httpClient'

export const useUserDataStore = defineStore('user-data', () => {
    const isAuthorized = ref(false)
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

    return {
        userInfo,
        setUserInfo,
        clearUserInfo,
        fetchUserInfo,

        userSettings
    }
})
