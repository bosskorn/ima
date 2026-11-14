import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fontsource/sarabun/thai-300.css'
import '@fontsource/sarabun/thai-400.css'
import '@fontsource/sarabun/thai-500.css'
import '@fontsource/sarabun/latin-300.css'
import '@fontsource/sarabun/latin-400.css'
import '@fontsource/sarabun/latin-500.css'
import './style.css'

createApp(App).use(createPinia()).use(router).mount('#app')

// Native niceties when running inside the Capacitor Android shell (no-ops in the browser).
import('@capacitor/status-bar').then(({ StatusBar }) => {
  StatusBar.setBackgroundColor({ color: '#0066FF' }).catch(() => {})
}).catch(() => {})
