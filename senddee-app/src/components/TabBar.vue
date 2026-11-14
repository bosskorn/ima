<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useOrders } from '../stores/orders'
const route = useRoute()
const orders = useOrders()
const tabs = [
  { to: '/', label: 'งานวันนี้', icon: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { to: '/shop', label: 'ในร้าน', icon: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8', badge: true },
  { to: '/receive', label: 'รับพัสดุ', fab: true },
  { to: '/search', label: 'ค้นหา', icon: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3' },
  { to: '/summary', label: 'สรุปยอด', icon: 'M4 20V10M10 20V4M16 20v-8M22 20H2' },
]
const active = (t) => (t.to === '/' ? route.path === '/' : route.path.startsWith(t.to))
</script>

<template>
  <nav class="tabbar">
    <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab" :class="{ on: active(t), fab: t.fab }">
      <span v-if="t.fab" class="fab-circle">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/></svg>
      </span>
      <span v-else class="ico">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path :d="t.icon"/></svg>
        <b v-if="t.badge && orders.waiting.length" class="dotbadge">{{ orders.waiting.length }}</b>
      </span>
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
.ico { position: relative; display: block; line-height: 0; }
.dotbadge { position: absolute; top: -6px; right: -12px; background: var(--accent); color: #fff; font-size: 10px; min-width: 17px; height: 17px;
  border-radius: 9px; display: grid; place-items: center; padding: 0 4px; line-height: 1; }
.fab { margin-top: -22px; color: var(--primary); }
.fab-circle { width: 56px; height: 56px; border-radius: 50%; background: var(--accent); display: grid; place-items: center;
  box-shadow: 0 6px 16px rgba(249,115,22,.4); }
</style>
