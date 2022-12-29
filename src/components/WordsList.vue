<script lang="ts">
import { defineComponent } from 'vue'
import { useWordListStore } from '@/stores/word-list'
import { storeToRefs } from 'pinia'

import ButtonBase from '@/components/ButtonBase.vue'

export default defineComponent({
  components: { ButtonBase },

  setup() {
    const { fetchWordList, removePair } = useWordListStore()
    fetchWordList()

    const { list } = storeToRefs(useWordListStore())

    function remove(pairId: string) {
      removePair(pairId)
    }

    return {
      wordList: list,
      remove
    }
  }
})
</script>

<template>
  <div class="words-list-wrap">
    <TransitionGroup name="word-list" class="word-list" tag="ul">
      <li class="words-list__item" v-for="pair in wordList" :key="pair.id">
        <p class="words-list__text">{{ pair.en }}</p>
        <div class="separator"></div>
        <p class="words-list__text">{{ pair.ru }}</p>

        <button-base class="btn-delete" @click="remove(pair.id)">x</button-base>
      </li>
    </TransitionGroup>
  </div>
</template>

<style lang="scss">
.words-list {
  display: flex;
  flex-direction: column-reverse;

  &__item {
    display: flex;
    background-color: var(--main-color);
    box-shadow: var(--main-shodow-bottom);
    border-radius: var(--default-b-radius);
    margin-bottom: 12px;
    padding: 4px 8px;
    transition: all .3s;

    &:hover,
    &:active {
      .btn-delete {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  &__text {
    width: 50%;
    padding: var(--space) calc(var(--space) * 2);
    overflow: hidden;

    &:last-child {
      border-bottom-right-radius: var(--default-b-radius);
      border-top-right-radius: var(--default-b-radius);
    }

    &:first-child {
      border-top-left-radius: var(--default-b-radius);
      border-bottom-left-radius: var(--default-b-radius);
    }
  }
}

.separator {
  width: 2px;
  background-color: var(--c-accent);
}

.btn-delete {
  display: inline-block;
  width: 22px;
  height: 22px;
  visibility: hidden;
  opacity: 0;
  margin-top: 4px;
}

.word-list-move,
.word-list-enter-active,
.word-list-leave-active {
  transition: all 0.3s;
}

.word-list-enter-from,
.word-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.word-list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
