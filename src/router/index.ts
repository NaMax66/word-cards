import { createRouter, createWebHistory } from 'vue-router'
import LearnWords from '../views/LearnWordsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'learn words',
      component: LearnWords
    },
    {
      path: '/words-list',
      name: 'words list',
      component: () => import('../views/WordsListView.vue')
    },
  ]
})

export default router
