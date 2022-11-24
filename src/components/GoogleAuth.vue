<template>
  <div>
    <div v-show="!isSignedIn" id="google-login-btn"></div>
    <div class="signed-out-controller" v-show="isSignedIn">
      <img class="user-photo" :src="userInfo.picture" alt="user photo">
      <div class="ml-2">
        <h4>{{ userInfo.name }}</h4>
        <a href="#" @click.prevent="logout">sign out</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import httpClient from '@/services/httpClient'
import Cookies from 'js-cookie'
import { ref } from 'vue'

const isSignedIn = ref(checkIsSignedIn())

function checkIsSignedIn() {
  return !!Cookies.get('session-token')
}

const userInfo = ref({
  name: '',
  picture: '',

  setUserInfo({ name, picture }) {
    this.name = name
    this.picture = picture
  },
  clearUserInfo() {
    this.name = ''
    this.picture = ''
  },

  async fetchData() {
    const { data: { data } } = await httpClient.get('http://localhost:8080/user-data', {
      withCredentials: true
    })

    userInfo.value.setUserInfo(data)
  }
})

if (isSignedIn.value) {
  userInfo.value.fetchData()
}

async function logout() {
  await httpClient.get('http://localhost:8080/logout', { withCredentials: true })
  isSignedIn.value = checkIsSignedIn()
  userInfo.value.clearUserInfo()
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: import.meta.env.APP_GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  })
  google.accounts.id.renderButton(
      document.getElementById('google-login-btn'),
      { theme: 'outline', size: 'large' }
  )

  google.accounts.id.prompt()
}
async function handleCredentialResponse({ credential }) {
  await httpClient.post('http://localhost:8080/login', { credential }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  })

  userInfo.value.fetchData()

  isSignedIn.value = checkIsSignedIn()
}

</script>

<style scoped>
.user-photo {
  max-width: 60px;
  max-height: 60px;
  border-radius: 50%;
}

.signed-out-controller {
  display: flex;
  align-items: center;
}
</style>
