<script setup>
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()
const tabs = [
  { to: '/', label: 'หน้าแรก', icon: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { to: '/orders', label: 'ออเดอร์', icon: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8' },
  { to: '/new', label: 'สร้างส่ง', fab: true },
  { to: '/track', label: 'ติดตาม', icon: 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { to: '/profile', label: 'บัญชี', icon: 'M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
]
const active = (t) => (t.to === '/' ? route.path === '/' : route.path.startsWith(t.to))
</script>

<template>
  <nav class="tabbar">
    <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab" :class="{ on: active(t), fab: t.fab }">
      <span v-if="t.fab" class="fab-circle">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </span>
      <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path :d="t.icon"/></svg>
      <small>{{ t.label }}</small>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 560px; z-index: 20;
  display: flex; background: #fff; border-top: 1px solid var(--line); padding: 6px 4px calc(6px + var(--safe-bottom)); }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--muted); text-decoration: none; padding-top: 4px; }
.tab small { font-size: 11px; font-weight: 500; }
.tab.on { color: var(--primary); }
.fab { margin-top: -22px; color: var(--primary); }
.fab-circle { width: 54px; height: 54px; border-radius: 50%; background: var(--accent); display: grid; place-items: center;
  box-shadow: 0 6px 16px rgba(249,115,22,.4); }
</style>
