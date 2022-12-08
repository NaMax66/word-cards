<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import GoogleAuth from '@/components/GoogleAuth.vue'

</script>

<template>
  <header class="d-flex">
    <nav class="d-flex align-center gap-2">
      <div class="link-row">
        <RouterLink to="/">{{ $t('learn words') }}</RouterLink>
        <RouterLink to="/words-list">{{ $t('words list') }}</RouterLink>
      </div>
    </nav>
    <GoogleAuth class="ml-auto" />
  </header>
  <RouterView />
</template>

<style scoped>
.link-row {
  display: flex;
  gap: 8px;
}

@media (max-width: 700px) {
  .link-row {
    flex-direction: column;
  }
}
</style>
