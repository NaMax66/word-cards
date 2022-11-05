<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink class="mr-10" to="/">Учить слова</RouterLink>
      <RouterLink class="mr-10" to="/words-list">Список слов</RouterLink>
      <RouterLink to="/auth">Вход</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>

<style scoped>
</style>
