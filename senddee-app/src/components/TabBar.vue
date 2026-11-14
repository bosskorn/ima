<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useOrders } from '../stores/orders'
import { unreadCount } from '../utils/news'
const route = useRoute()
const orders = useOrders()
// Outline icons (stroke) for the bottom bar; the centre button is the quick "receive parcel" action.
const tabs = [
  { to: '/', label: 'หน้าที่', icon: 'M4 5h16v14H4zM4 10h16M9 5v14' },
  { to: '/news', label: 'ข่าวสาร', icon: 'M6 8a6 6 0 0 1 12 0c0 7 3 8 3 9H3c0-1 3-2 3-9zM10 21h4', badge: 'news' },
  { to: '/shop', label: 'ในร้าน', icon: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8', badge: 'shop' },
  { to: '/receive', label: '', fab: true },
  { to: '/search', label: 'ค้นหา', icon: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3' },
  { to: '/settings', label: 'โปรไฟล์', icon: 'M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
]
const active = (t) => (t.to === '/' ? route.path === '/' : route.path.startsWith(t.to))
const count = (t) => (t.badge === 'news' ? unreadCount() : t.badge === 'shop' ? orders.waiting.length : 0)
</script>

<template>
  <nav class="tabbar">
    <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab" :class="{ on: active(t), fab: t.fab }" :aria-label="t.fab ? 'รับพัสดุ' : t.label">
      <span v-if="t.fab" class="fab-sq">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/></svg>
      </span>
      <template v-else>
        <span class="ico">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path :d="t.icon"/></svg>
          <b v-if="count(t)" class="dotbadge">{{ count(t) }}</b>
        </span>
        <small>{{ t.label }}</small>
      </template>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 560px; z-index: 20;
  display: flex; align-items: center; background: #fff; border-top: 1px solid var(--line); padding: 6px 2px calc(6px + var(--safe-bottom)); }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1px; color: #7a818b; text-decoration: none; padding-top: 2px; }
.tab small { font-size: 12px; }
.tab.on { color: var(--primary); }
.ico { position: relative; display: block; line-height: 0; }
.dotbadge { position: absolute; top: -6px; right: -10px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 400; min-width: 17px; height: 17px;
  border-radius: 9px; display: grid; place-items: center; padding: 0 4px; line-height: 1; }
.fab-sq { width: 54px; height: 44px; border-radius: 12px; background: var(--accent); display: grid; place-items: center; }
</style>
