<script lang="ts">
 import { computed, ref, defineComponent } from 'vue'
 import { useWordListStore } from '@/stores/word-list'
 import { storeToRefs } from 'pinia'
 import cardStub from '@/stub/flipCard'
 import ButtonBase from '@/components/ButtonBase.vue'
 import isMobile from '@/utils/isMobile'
 import type {Pair} from "@/types/Pair";

 export default defineComponent({
   components: { ButtonBase },
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
       while(id === newIndex) {
         newIndex = getRandomIndex(list.value.length)
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

     return {
       currentCard,
       flip,
       flipMobileOnly,
       copyToClipboard,
       next,
       currentView,

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
             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
               <path d="M0 0h24v24H0z" fill="none"/>
               <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
             </svg>
           </button-base>
         </article>
         <article @click="flipMobileOnly" v-else class="word-card">
           <h2 class="grow color-accent">{{ currentCard.translation.value }}</h2>
           <button-base @click="copyToClipboard(currentCard.translation.value)" class="word-card__btn" @click.stop>
             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
               <path d="M0 0h24v24H0z" fill="none"/>
               <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
             </svg>
           </button-base>
         </article>
       </Transition>
       <div class="card-controls">
         <button-base class="flip-btn" theme="default" @click="flip">{{ $t('flip') }}</button-base>
         <button-base class="next-btn" theme="accent" @click="next">{{ $t('next') }}</button-base>
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

  @include devices-mobile {
    max-height: none;
    max-width: none;
  }
}

.card-controls {
  position: relative;
  display: flex;
  width: auto;
  max-width: 350px;
  gap: 12px;
  margin-top: 24px;

  @include devices-mobile {
    max-width: none;
    position: fixed;
    width: calc(100% - 16px);
    bottom: 8px;
    left: 8px;
  }
}

.next-btn,
.flip-btn {
  flex-grow: 1;
  width: 40px;
  height: 40px;
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
