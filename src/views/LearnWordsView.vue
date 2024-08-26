<script lang="ts">
 import { computed, ref, defineComponent } from 'vue'
 import type { ComputedRef } from 'vue'
 import { useWordListStore } from '@/stores/word-list'
 import { storeToRefs } from 'pinia'
 import cardStub from '@/defaultData/flipCard'
 import ButtonBase from '@/components/base/BaseButton.vue'
 import isMobile from '@/utils/isMobile'
 import type { Pair } from '@/types/Pair'
 import AddPair from '@/components/AddPair/AddPair.vue'
 import IconCopy from '@/components/icons/IconCopy.vue'

 export default defineComponent({
   components: { IconCopy, AddPair, ButtonBase },
   setup() {
     const { fetchWordList } = useWordListStore()
     fetchWordList()

     const { list } = storeToRefs(useWordListStore())

     const getRandomIndex = (maxIndex: number) => {
       return Math.floor(Math.random() * maxIndex)
     }

     let index = ref(getRandomIndex(list.value.length))

     setInterval(() => {
       index.value = getRandomIndex(list.value.length)
     }, 60000 * 5)

     const currentCard = computed<Pair>(() => {
       return list.value[index.value] || cardStub
     })

     const currentView = ref<'origin' | 'translation'>('origin')

     const flip = () => {
       currentView.value = currentView.value === 'origin' ? 'translation' : 'origin'
     }

     const next = () => {
       const id = index.value
       let newIndex = getRandomIndex(list.value.length)
       if(id === newIndex) {
         if(newIndex === list.value.length - 1) {
           newIndex = 0
         } else {
           newIndex++
         }
       }
       index.value = newIndex
     }

     const flipMobileOnly = () => {
       isMobile && flip()
     }

     const copyToClipboard = (txt: string) => {
       navigator.clipboard.writeText(txt)
       /* todo add notifications */
     }

     function setCurrent(pair: Omit<Pair, 'id'>) {
       index.value = list.value.findIndex(el =>
           el.translation.value === pair.translation.value &&
           el.origin.value === pair.origin.value
       )
     }

     const isNextBtnActive: ComputedRef<boolean> = computed((): boolean => list.value.length > 1)

     return {
       currentCard,
       flip,
       flipMobileOnly,
       copyToClipboard,
       next,
       currentView,

       setCurrent,

       isNextBtnActive,

       isMobile
     }
   }
 })
</script>

<template>
  <main class="learn-words container">
     <div class="under-header">
       <Transition name="card">
         <article @click="flipMobileOnly" v-if="currentView === 'origin'" class="word-card">
           <h2 class="grow">{{ currentCard.origin.value }}</h2>
           <button-base @click="copyToClipboard(currentCard.origin.value)" class="word-card__btn" @click.stop>
             <icon-copy />
           </button-base>
           <span class="word-card__lang">{{ currentCard.origin.lang }} &#8594; {{ currentCard.translation.lang }}</span>
         </article>
         <article @click="flipMobileOnly" v-else class="word-card">
           <h2 class="grow color-accent">{{ currentCard.translation.value }}</h2>
           <button-base @click="copyToClipboard(currentCard.translation.value)" class="word-card__btn" @click.stop>
             <icon-copy />
           </button-base>
           <span class="word-card__lang">{{ currentCard.translation.lang }} &#8594; {{ currentCard.origin.lang }}</span>
         </article>
       </Transition>

       <div class="card-controls">
         <button-base theme="accent" @click="flip">{{ $t('flip') }}</button-base>
         <button-base :disabled="!isNextBtnActive" theme="default" @click="next">{{ $t('next') }}</button-base>
         <add-pair @added="setCurrent" />
       </div>
     </div>
  </main>
</template>

<style lang="scss" scoped>
@import "@/assets/media.scss";

.learn-words {
  display: flex;
  flex-direction: column;
  padding: 0 8px;

  @include devices-mobile {
    padding: 16px 8px;
    overflow: hidden;
  }
}

.word-card {
  position: relative;
  display: flex;
  gap: 12px;
  max-width: 350px;
  max-height: 600px;
  min-height: 90px;
  background-color: var(--main-color);
  box-shadow: var(--main-shodow-bottom);
  border-radius: var(--default-b-radius);
  padding: calc(var(--space) * 2);

  &__btn {
    align-self: flex-end;
    padding: 4px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__lang {
    position: absolute;
    line-height: 1;
    top: calc(var(--space) * 0.5);
    right: calc(var(--space) * 2);
    color: var(--main-contrast-light);
  }

  @include devices-mobile {
    max-height: none;
    max-width: none;
  }
}

.card-controls {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: auto;
  max-width: 350px;
  gap: 12px;
  margin-top: 24px;
  height: 4rem;

  @include devices-mobile {
    max-width: none;
    position: fixed;
    width: calc(100% - 16px);
    bottom: 8px;
    left: 8px;
  }
}

.card-move,
.card-enter-active,
.card-leave-active {
  transition: all 0.3s;
}

.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.card-leave-active {
  position: absolute;
  width: 100%;
}
</style>
