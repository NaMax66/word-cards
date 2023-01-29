<script setup lang="ts">
import { RouterView } from 'vue-router'
import HeaderMain from '@/components/HeaderMain.vue'
import AppModal from '@/components/AppModal.vue'
</script>

<template>
  <HeaderMain />
  <RouterView />
  <AppModal />
</template>
