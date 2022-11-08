import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      'learn words': 'learn words',
      'words list': 'words list'
    },
    ru: {
      'learn words': 'учить слова',
      'words list': 'список слов'
    }
  }
})

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
