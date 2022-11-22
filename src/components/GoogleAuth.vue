<template>
  <div>
    <div id="google-login-btn"></div>
    <a href="#" @click.prevent="logout">sign out</a>
  </div>
</template>

<script setup>
import axios from 'axios'
function logout() {
}

function handleCredentialResponse({ credential }) {
  axios.post('http://localhost:8080/login', { credential }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
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
