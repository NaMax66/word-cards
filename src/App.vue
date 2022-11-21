<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import LangSwitcher from '@/components/LangSwitcher.vue'
import GoogleAuth from '@/components/GoogleAuth.vue'

</script>

<template>
  <header class="d-flex">
    <nav>
      <RouterLink to="/">{{ $t('learn words') }}</RouterLink>
      <RouterLink class="ml-2" to="/words-list">{{ $t('words list') }}</RouterLink>
      <RouterLink class="ml-2" to="/auth">{{ $t('auth') }}</RouterLink>
      <LangSwitcher class="ml-3 d-inline-block" />
    </nav>
    <GoogleAuth class="ml-auto" />
  </header>
  <RouterView />
</template>

<style scoped>
</style>
