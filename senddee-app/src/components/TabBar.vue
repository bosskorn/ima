<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useOrders } from '../stores/orders'
const route = useRoute()
const orders = useOrders()

// Five fixed slots: three destinations, one primary action in the middle, profile at the end.
const tabs = [
  { to: '/', label: 'หน้าหลัก', icon: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { to: '/shop', label: 'พัสดุในร้าน', icon: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8', badge: true },
  { to: '/receive', label: 'รับพัสดุ', primary: true },
  { to: '/search', label: 'ค้นหา', icon: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3' },
  { to: '/settings', label: 'โปรไฟล์', icon: 'M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
]
const active = (t) => (t.to === '/' ? route.path === '/' : route.path.startsWith(t.to))
</script>

<template>
  <nav class="tabbar" aria-label="เมนูหลัก">
    <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab" :class="{ on: active(t), primary: t.primary }">
      <span v-if="t.primary" class="cta">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/></svg>
      </span>
      <span v-else class="pill">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" :stroke-width="active(t) ? 2.1 : 1.7" stroke-linecap="round" stroke-linejoin="round"><path :d="t.icon"/></svg>
        <b v-if="t.badge && orders.waiting.length" class="badge-n">{{ orders.waiting.length > 99 ? '99+' : orders.waiting.length }}</b>
      </span>
      <small>{{ t.label }}</small>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 560px; z-index: 20;
  display: grid; grid-template-columns: repeat(5, 1fr); align-items: end; background: #fff; border-top: 1px solid var(--line);
  padding: 6px 4px calc(8px + var(--safe-bottom)); box-shadow: 0 -2px 10px rgba(15,23,42,.05); }
.tab { display: flex; flex-direction: column; align-items: center; gap: 2px; color: #7a818b; text-decoration: none; min-height: 52px; justify-content: flex-end; }
.tab small { font-size: 12px; line-height: 1.2; white-space: nowrap; }
.pill { position: relative; width: 56px; height: 30px; border-radius: 15px; display: grid; place-items: center; transition: background .15s; }
.tab.on { color: var(--primary); } .tab.on .pill { background: var(--primary-soft); } .tab.on small { font-weight: 500; }
.badge-n { position: absolute; top: -4px; right: -1px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 400; min-width: 17px; height: 17px;
  border-radius: 9px; display: grid; place-items: center; padding: 0 4px; line-height: 1; border: 1.5px solid #fff; box-sizing: content-box; }
.primary { color: var(--accent); }
.cta { width: 58px; height: 58px; border-radius: 18px; background: var(--accent); display: grid; place-items: center; margin-top: -26px;
  border: 4px solid #fff; box-sizing: content-box; box-shadow: 0 4px 10px rgba(249,115,22,.35); }
.primary small { font-weight: 500; }
</style>
