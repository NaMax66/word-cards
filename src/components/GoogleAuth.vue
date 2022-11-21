<template>
  <div>
    <div id="google-login-btn"></div>
    <a href="#" @click.prevent="logout">sign out</a>
  </div>
</template>

<script setup>
function logout() {
}

function handleCredentialResponse(response) {
  console.log('Encoded JWT ID token: ' + response.credential)
}
window.onload = function () {
  google.accounts.id.initialize({
    client_id: '',
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
