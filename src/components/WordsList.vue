<script lang="ts">
import { defineComponent } from 'vue'
import { useWordListStore } from '@/stores/word-list'
import { storeToRefs } from 'pinia'

import eventBus from '@/services/eventBus'

import ButtonBase from '@/components/ButtonBase.vue'
import IconPencil from '@/components/icons/IconPencil.vue'

export default defineComponent({
  components: {IconPencil, ButtonBase },

  setup() {
    const { fetchWordList, removePair } = useWordListStore()
    fetchWordList()

    const { list } = storeToRefs(useWordListStore())

    function remove(pairId: string | number) {
      removePair(pairId)
    }

    function openEdit(pairId: string) {
      eventBus.emit('openModal', pairId)
    }

    return {
      wordList: list,
      remove,
      openEdit
    }
  }
})
</script>

<template>
  <div class="words-list-wrap">
    <TransitionGroup name="word-list" class="word-list" tag="ul">
      <li class="words-list__item" v-for="item in wordList" :key="item.id">
        <p class="words-list__text">{{ item.pair.en }}</p>
        <div class="separator"></div>
        <p class="words-list__text">{{ item.pair.ru }}</p>


        <div class="hidden-controls">
          <button-base class="hidden-controls__btn" @click="openEdit(pair.id)">
            <icon-pencil class="hidden-controls__icon" />
          </button-base>
          <button-base class="hidden-controls__btn" @click="remove(item.id)">x</button-base>
        </div>
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
      .hidden-controls {
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

.hidden-controls {
  margin-top: 4px;
  visibility: hidden;
  opacity: 0;
  display: flex;
  gap: 8px;

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 2px;
  }

  &__icon {
    width: 18px;
    height: 18px;
  }
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
