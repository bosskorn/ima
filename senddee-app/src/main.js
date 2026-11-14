import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(createPinia()).use(router).mount('#app')

// Native niceties when running inside the Capacitor Android shell (no-ops in the browser).
import('@capacitor/status-bar').then(({ StatusBar }) => {
  StatusBar.setBackgroundColor({ color: '#0f766e' }).catch(() => {})
}).catch(() => {})
