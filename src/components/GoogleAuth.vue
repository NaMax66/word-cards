<template>
  <div class="google-auth">
    <div v-show="!isSignedIn" ref="googleLoginBtn"></div>
    <div class="signed-out-controller" v-show="isSignedIn">
      <img v-show="isImgLoaded" @load="onImgLoad" class="user-photo" :src="userInfo.picture" alt="user photo">
      <div v-show="!isImgLoaded" class="user-photo-stab">U</div>
      <div class="ml-2">
        <h4 class="user-name">{{ userInfo.name }}</h4>
        <a class="sign-out" href="#" @click.prevent="logout">sign out</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import httpClient from '@/services/httpClient'
import Cookies from 'js-cookie'
import { ref } from 'vue'
import { GoogleAuth } from '@/services/auth'

const googleLoginBtn = ref(null)

/* @ts-ignore */
GoogleAuth.init(handleCredentialResponse).then(() => {
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

const isImgLoaded = ref(false)
function onImgLoad() {
  isImgLoaded.value = true
}

</script>

<style scoped>
.google-auth {
  background-color: var(--main-color);
  box-shadow: var(--main-shodow-top);
  border-radius: var(--default-b-radius);
  padding: 12px 16px;
}
.user-photo-stab,
.user-photo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.user-photo-stab {
  border: 1px solid var(--main-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 800px) {
  .google-auth {
    padding: 8px 12px;
  }
  .user-photo-stab,
  .user-photo {
    width: 35px;
    height: 35px;
  }
}

.signed-out-controller {
  display: flex;
  align-items: center;
}

.user-name {
  font-size: 16px;
}

.sign-out {
  font-size: 14px;
}

@media (max-width: 800px) {
  .user-name {
    font-size: 14px;
  }

  .sign-out {
    font-size: 12px;
  }
}
</style>
