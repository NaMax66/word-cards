<script lang="ts" setup>
  import { useLangStore } from '@/stores/languages'
  import { useWordListStore } from '@/stores/word-list'
  import ButtonBase from '@/components/ButtonBase.vue'
  import InputBase from '@/components/InputBase.vue'

  const { userLang, targetLang } = useLangStore()
  const { addPair: addPairInStore } = useWordListStore()

  const addPair = (e: Event) => {
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    addPairInStore({
      origin: {
        lang: userLang,
        value: formData.get('userLang') as string
      },
      translation: {
        lang: targetLang,
        value: formData.get('targetLang') as string
      }
    })

    form.reset()
  }
</script>

<template>
  <form @submit.prevent="addPair" autocomplete="off">
<!--    <div class="form-item">
      <label class="input-label" for="targetLang">{{ targetLang }}</label>
      <input-base class="w-100" required id="targetLang" name="targetLang" />
    </div>
    <div class="form-item">
      <label class="input-label" for="userLang">{{ userLang }}</label>
      <input-base class="w-100" required id="userLang" name="userLang" />
    </div>-->
    <button-base class="add-pair-btn" type="submit" theme="accent">{{ $t('add pair') }}</button-base>
  </form>
</template>

<style lang="scss" scoped>
@import "@/assets/media.scss";

.add-pair-btn {
  height: 100%;
  width: 100%;
}

.add-pair {
  display: flex;
  position: fixed;
  width: 100%;
  height: 5rem;
  padding: calc(var(--space) * 2) calc(var(--space));
  @include devices-tablet {
  }
}

</style>
