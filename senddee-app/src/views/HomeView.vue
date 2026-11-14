<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import OrderCard from '../components/OrderCard.vue'
import { useOrders } from '../stores/orders'
import { useProfile } from '../stores/profile'

const orders = useOrders()
const profile = useProfile()
const router = useRouter()
onMounted(() => orders.load())

const today = computed(() => {
  const d = new Date().toDateString()
  return orders.list.filter((o) => new Date(o.createdAt).toDateString() === d).length
})
const actions = [
  { label: 'สร้างออเดอร์', to: '/new', color: '#f97316', icon: 'M12 5v14M5 12h14' },
  { label: 'ติดตามพัสดุ', to: '/track', color: '#0f766e', icon: 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z' },
  { label: 'ออเดอร์ทั้งหมด', to: '/orders', color: '#2563eb', icon: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5' },
]
</script>

<template>
  <div class="page">
    <AppHeader :title="`Senddee · ${profile.branch}`" sub="ส่งง่าย ส่งดี ถึงมือชัวร์" />

    <div class="stats">
      <div class="card stat"><b>{{ orders.active.length }}</b><span class="muted">กำลังจัดส่ง</span></div>
      <div class="card stat"><b>{{ today }}</b><span class="muted">สร้างวันนี้</span></div>
      <div class="card stat"><b>฿{{ orders.codPending.toLocaleString() }}</b><span class="muted">COD รอเก็บ</span></div>
    </div>

    <div class="actions">
      <button v-for="a in actions" :key="a.to" class="act card" @click="router.push(a.to)">
        <span class="ic" :style="{ background: a.color }">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path :d="a.icon"/></svg>
        </span>
        <span>{{ a.label }}</span>
      </button>
    </div>

    <div class="row between"><h2 class="section-title">ออเดอร์ล่าสุด</h2><RouterLink to="/orders" class="more">ดูทั้งหมด</RouterLink></div>
    <p v-if="orders.loading" class="muted">กำลังโหลด…</p>
    <OrderCard v-for="o in orders.list.slice(0, 4)" :key="o.id" :order="o" />
  </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: -30px; }
.stat { margin: 0 !important; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 12px 6px; text-align: center; }
.stat b { font-size: 19px; color: var(--primary); }
.stat span { font-size: 12px; }
.actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
.act { border: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 6px; font-size: 13px; font-weight: 600; color: var(--text); margin: 0 !important; }
.ic { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; }
.more { color: var(--primary); font-size: 13px; text-decoration: none; font-weight: 600; }
</style>
