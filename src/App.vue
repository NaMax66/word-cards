<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Учить слова</RouterLink>
      <RouterLink to="/words-list">Список слов</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>

<style scoped>
</style>
