<template>
  <div>
    <select class="select-base" :value="value" @input="$emit('change', $event.target.value)">
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

<script lang="ts" setup>
defineProps<{ value: string }>()
defineEmits<{
  (e: 'change', lang: string): void
}>()
</script>
