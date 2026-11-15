<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import BrandLogo from '../components/BrandLogo.vue'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { unreadCount } from '../utils/news'

const orders = useOrders(); const session = useSession(); const router = useRouter()
onMounted(() => orders.load())

// One menu for everyone. Every tile opens a working screen; `badge` is a live work counter.
const sections = computed(() => [
  { title: 'รับฝากและส่งมอบ', items: [
    { label: 'รับพัสดุ', icon: 'receive', to: '/receive' },
    { label: 'พัสดุในร้าน', icon: 'shop', to: '/shop', badge: orders.waiting.length },
    { label: 'ส่งมอบขนส่ง', icon: 'handover', to: '/shop?select=all' },
    { label: 'ใบปะหน้าซ้ำ', icon: 'label', to: '/search?label=1' },
  ] },
  { title: 'ค้นหาและตรวจสอบ', items: [
    { label: 'ค้นหาพัสดุ', icon: 'search', to: '/search' },
    { label: 'กำลังขนส่ง', icon: 'transit', to: '/search?filter=in_transit' },
    { label: 'ค้างเกิน 24 ชม.', icon: 'overdue', to: '/shop?filter=overdue', badge: orders.overdue.length, red: true },
    { label: 'รายการยกเลิก', icon: 'void', to: '/search?filter=cancelled' },
  ] },
  { title: 'เครื่องมือหน้าร้าน', items: [
    { label: 'เช็คราคา', icon: 'quote', to: '/quote' },
    { label: 'ยกเลิก (Void)', icon: 'voidnow', to: '/search?filter=received&void=1' },
    { label: 'เช็คเครดิตลูกค้า', icon: 'closing', to: '/credit' },
    { label: 'แจ้งปัญหา', icon: 'issue', to: '/issues' },
  ] },
  { title: 'อื่น ๆ', items: [
    { label: 'ข่าวสาร', icon: 'news', to: '/news', badge: unreadCount() },
    { label: 'ตั้งค่า', icon: 'settings', to: '/settings' },
  ] },
])
</script>

<template>
  <div class="page">
    <header class="top">
      <div class="brand"><BrandLogo variant="white" :size="38" /><div><b>Send<span>Dee</span></b><small>{{ session.branch }} · {{ session.name }}</small></div></div>
      <button class="bell" aria-label="ข่าวสาร" @click="router.push('/news')">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 9H3c0-1 3-2 3-9zM10 21h4"/></svg>
        <i v-if="unreadCount()" />
      </button>
    </header>

    <section v-for="sec in sections" :key="sec.title" class="sec">
      <h4>{{ sec.title }}</h4>
      <div class="grid">
        <button v-for="m in sec.items" :key="m.label" class="item" @click="router.push(m.to)">
          <span class="ic"><AppIcon :name="m.icon" :size="46" /><i v-if="m.badge" class="bd" :class="{ red: m.red }">{{ m.badge }}</i></span>
          <span class="lb">{{ m.label }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.top { background: var(--primary); color: #fff; padding: calc(10px + var(--safe-top)) 16px 10px; margin: 0 -16px 10px; display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 10px; } .brand b { display: block; font-size: 17px; line-height: 1.1; font-weight: 500; } .brand small { opacity: .85; font-size: 12px; }
.brand b span { color: #7FEEFF; }
.bell { position: relative; border: 0; background: transparent; padding: 4px; line-height: 0; }
.bell i { position: absolute; top: 3px; right: 3px; width: 9px; height: 9px; border-radius: 50%; background: #ef4444; border: 1.5px solid var(--primary); }
.sec { background: #fff; margin: 0 -16px 10px; padding: 4px 16px 16px; }
.sec h4 { margin: 0; padding: 12px 0 10px; font-size: 13px; font-weight: 400; color: var(--muted); }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px 4px; }
.item { border: 0; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 0 2px; color: var(--text); }
.ic { position: relative; display: block; line-height: 0; }
.bd { position: absolute; top: -6px; right: -9px; background: var(--primary); color: #fff; font-style: normal; font-size: 11px; min-width: 20px; height: 20px; border-radius: 10px; display: grid; place-items: center; padding: 0 5px; line-height: 1; }
.bd.red { background: #ef4444; }
.lb { font-size: 13px; line-height: 1.25; text-align: center; color: #555b63; }
</style>
