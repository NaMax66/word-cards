import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'

import './assets/main.scss'
import en from '@/locales/en'
import ru from '@/locales/ru'
import { getBrowserInterfaceLanguage } from '@/services/interfaceLanguage'

const app = createApp(App)
const interfaceLanguage = getBrowserInterfaceLanguage()

const i18n = createI18n({
  legacy: false,
  locale: interfaceLanguage,
  messages: { en, ru }
})

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
