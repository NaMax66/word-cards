<template>
  <div class="google-auth">
    <div v-show="!isSignedIn" ref="googleLoginBtn"></div>
    <div class="signed-out-controller" v-show="isSignedIn">
      <img v-if="userInfo.picture" class="user-photo" :src="userInfo.picture" alt="user photo">
      <div v-else class="user-photo-stab"><p>:-)</p></div>
      <div class="ml-2">
        <a class="sign-out" href="#" @click.prevent="logout">
          <icon-logout />
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import checkIsSignedIn from '@/services/checkIsSignedIn'
import { onUnmounted, ref } from 'vue'
import { authApi, GoogleAuth } from '@/services/auth'
import { onAuthenticationRequired } from '@/services/authEvents'
import { observeTabOpen } from '@/services/tabOpenObserver'
import { useUserDataStore } from '@/stores/userData'
import IconLogout from '@/components/icons/IconLogout.vue'

const { userInfo, clearUserInfo, fetchUserInfo } = useUserDataStore()

const googleLoginBtn = ref<HTMLElement | null>(null)

observeTabOpen(() => {
  if (checkIsSignedIn()) {
    fetchUserInfo()
  }
})

const stopAuthRequiredListener = onAuthenticationRequired(() => {
  GoogleAuth.prompt()
})

onUnmounted(stopAuthRequiredListener)

GoogleAuth.init(handleCredentialResponse).then(() => {
  GoogleAuth.renderButton(googleLoginBtn.value)
})

const isSignedIn = ref(checkIsSignedIn())

if (isSignedIn.value) {
  fetchUserInfo()
}

async function logout() {
  await authApi.logout()
  isSignedIn.value = checkIsSignedIn()
  clearUserInfo()
  window.location.reload()
}

async function handleCredentialResponse({ credential }: { credential: string }) {
  await authApi.login(GoogleAuth, credential)

  await fetchUserInfo()

  isSignedIn.value = checkIsSignedIn()
  window.location.reload()
}
</script>

<style lang="scss" scoped>
@import "@/assets/media.scss";

.google-auth {
  background-color: var(--main-color);
  box-shadow: var(--main-shodow-top);
  border-radius: var(--default-b-radius);
  padding: 6px 8px;
}

.user-photo-stab,
.user-photo {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.user-photo-stab {
  border: 1px solid var(--main-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.signed-out-controller {
  display: flex;
  align-items: center;
}

.user-name {
  font-size: 16px;

  @include devices-tablet {
    font-size: 14px;
  }
}

.sign-out {
  font-size: 14px;
  margin-left: var(--space);
  text-align: center;

  @include devices-tablet {
    font-size: 12px;
  }
}
</style>
