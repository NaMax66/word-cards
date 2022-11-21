<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import LangSwitcher from '@/components/LangSwitcher.vue'

</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">{{ $t('learn words') }}</RouterLink>
      <RouterLink class="ml-2" to="/words-list">{{ $t('words list') }}</RouterLink>
      <LangSwitcher class="ml-3 d-inline-block" />
    </nav>
  </header>
  <RouterView />
</template>

<style scoped>
</style>
