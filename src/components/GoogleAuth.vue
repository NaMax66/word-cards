<template>
  <div>
    <div v-show="!isSignedIn" id="google-login-btn"></div>
    <div v-show="isSignedIn">
      <img :src="userInfo.img" alt="user photo">
      <h4>{{ userInfo.name }}</h4>
      <a href="#" @click.prevent="logout">sign out</a>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import Cookies from 'js-cookie'
import { ref } from 'vue'

async function logout() {
  await axios.get('http://localhost:8080/logout', {
    withCredentials: true
  })
  isSignedIn.value = checkIsSignedIn()
}

const isSignedIn = ref(checkIsSignedIn())

const userInfo = ref({
  name: '',
  img: ''
})

async function handleCredentialResponse({ credential }) {
  await axios.post('http://localhost:8080/login', { credential }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  })

  isSignedIn.value = checkIsSignedIn()
}

function checkIsSignedIn() {
  return !!Cookies.get('session-token')
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: import.meta.env.APP_GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  })
  google.accounts.id.renderButton(
      document.getElementById('google-login-btn'),
      { theme: 'outline', size: 'large' }  // customization attributes
  )

  // google.accounts.id.prompt() // also display the One Tap dialog
}
</script>

<style scoped>

</style>
