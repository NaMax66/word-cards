<template>
  <div>
    <select class="select-base" v-model="$i18n.locale">
      <option
          v-for="locale in $i18n.availableLocales"
          :key="`locale-${locale}`"
          :value="locale"
      >
        {{ locale }}
      </option>
    </select>
  </div>
</template>

<script setup>
</script>

<style>
.select-base {
  border: none;
  outline: none;
  background: var(--c-background);
  padding: 8px 12px;
  box-shadow: var(--main-shodow-top);
  border-radius: var(--default-b-radius);
  font-size: var(--fs-main);
}
</style>
