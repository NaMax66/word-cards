<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import GoogleAuth from '@/components/GoogleAuth.vue'
</script>

<template>
  <header class="header-main">
    <div class="container header-content">
      <nav class="d-flex align-center gap-2">
        <div class="link-row">
          <RouterLink to="/">{{ $t('learn words') }}</RouterLink>
          <RouterLink to="/words-list">{{ $t('words list') }}</RouterLink>
        </div>
      </nav>
      <GoogleAuth class="ml-auto" />
    </div>
  </header>
</template>

<style lang="scss" scoped>
@import "@/assets/media.scss";

.header-main {
  position: fixed;
  top: 0;
  z-index: var(--z-idx-over);
  width: 100%;
  color: var(--main-contrast);
  background-color: var(--c-background-a85);
  padding: 8px;
  backdrop-filter: blur(5px);
}

.header-content {
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}

.link-row {
  display: flex;
  gap: 8px;

  @include devices-tablet {
    flex-direction: column;
  }
}

.router-link-active {
  color: var(--c-accent);
  text-decoration: underline;
}

a {
  color: var(--main-contrast-light);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
