<template>
  <div class="google-auth">
    <div v-show="!isSignedIn" ref="googleLoginBtn"></div>
    <div class="signed-out-controller" v-show="isSignedIn">
      <img class="user-photo" :src="userInfo.picture" alt="user photo">
      <div class="ml-2">
        <h4>{{ userInfo.name }}</h4>
        <a href="#" @click.prevent="logout">sign out</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import httpClient from '@/services/httpClient'
import Cookies from 'js-cookie'
import { ref, onMounted } from 'vue'
import { GoogleAuth } from '@/services/auth'

const googleLoginBtn = ref(null)

onMounted(() => {
  /* @ts-ignore */
  GoogleAuth.init(handleCredentialResponse)
  /* @ts-ignore */
  GoogleAuth.renderButton(googleLoginBtn.value)
})

const isSignedIn = ref(checkIsSignedIn())

function checkIsSignedIn() {
  return !!Cookies.get('session-token')
}

const userInfo = ref({
  name: '',
  picture: '',

  setUserInfo({ name, picture }: { name: string, picture: string }) {
    this.name = name
    this.picture = picture
  },

  clearUserInfo() {
    this.name = ''
    this.picture = ''
  },

  async fetchData() {
    const { data: { data } } = await httpClient.get('/user-data', {
      withCredentials: true
    })

    userInfo.value.setUserInfo(data)
  }
})

if (isSignedIn.value) {
  userInfo.value.fetchData()
}

async function logout() {
  await httpClient.get('/logout', { withCredentials: true })
  isSignedIn.value = checkIsSignedIn()
  userInfo.value.clearUserInfo()
  window.location.reload()
}

async function handleCredentialResponse({ credential }: { credential: string }) {
  await httpClient.post('/login', { credential }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  })

  userInfo.value.fetchData()

  isSignedIn.value = checkIsSignedIn()
  window.location.reload()
}

</script>

<style scoped>
.user-photo {
  max-width: 50px;
  max-height: 50px;
  border-radius: 50%;
}

.signed-out-controller {
  display: flex;
  align-items: center;
}

.google-auth {
  background-color: var(--main-color);
  box-shadow: var(--main-shodow-top);
  border-radius: var(--default-b-radius);
  padding: 12px 16px;
}
</style>
