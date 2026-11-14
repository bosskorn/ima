<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { baht } from '../utils/format'
import { unreadCount } from '../utils/news'

const orders = useOrders(); const session = useSession(); const router = useRouter()
onMounted(() => orders.load())
const role = ref(0)
const roles = ['พนักงานหน้าร้าน', 'ผู้ดูแลสาขา']
const sum = computed(() => orders.summary)

// Every tile opens a real screen. `badge` is a live counter; `red` makes it a warning colour.
const menus = computed(() => [
  [
    { label: 'รับพัสดุ', icon: 'receive', to: '/receive' },
    { label: 'พัสดุในร้าน', icon: 'shop', to: '/shop', badge: orders.waiting.length },
    { label: 'ส่งมอบขนส่ง', icon: 'handover', to: '/shop?select=all' },
    { label: 'ค้นหาพัสดุ', icon: 'search', to: '/search' },
    { label: 'เช็คราคา', icon: 'quote', to: '/quote' },
    { label: 'พิมพ์ใบปะหน้าซ้ำ', icon: 'label', to: '/search?label=1' },
    { label: 'อยู่ระหว่างขนส่ง', icon: 'transit', to: '/search?filter=in_transit' },
    { label: 'พัสดุค้างเกิน 24 ชม.', icon: 'overdue', to: '/shop?filter=overdue', badge: orders.overdue.length, red: true },
    { label: 'ยกเลิก (Void)', icon: 'void', to: '/search?filter=received' },
    { label: 'แจ้งปัญหา', icon: 'issue', to: '/issues' },
    { label: 'ข่าวสารสำนักงานใหญ่', icon: 'news', to: '/news', badge: unreadCount() },
    { label: 'ตั้งค่าเครื่องพิมพ์', icon: 'settings', to: '/settings' },
  ],
  [
    { label: 'สรุปยอดวันนี้', icon: 'summary', to: '/summary' },
    { label: 'ปิดยอดเงินสด', icon: 'closing', to: '/summary?close=1' },
    { label: 'พัสดุค้างเกิน 24 ชม.', icon: 'overdue', to: '/shop?filter=overdue', badge: orders.overdue.length, red: true },
    { label: 'รายการยกเลิก', icon: 'void', to: '/search?filter=cancelled' },
    { label: 'แจ้งปัญหา', icon: 'issue', to: '/issues' },
    { label: 'ข้อมูลสาขา', icon: 'settings', to: '/settings' },
  ],
][role.value])
</script>

<template>
  <div class="page">
    <header class="top">
      <div class="brand"><span class="logo">S</span><div><b>Senddee</b><small>{{ session.branch }} · {{ session.name }}</small></div></div>
      <button class="bell" aria-label="ข่าวสาร" @click="router.push('/news')">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 9H3c0-1 3-2 3-9zM10 21h4"/></svg>
        <i v-if="unreadCount()" />
      </button>
    </header>

    <div class="tabs">
      <button v-for="(r, i) in roles" :key="r" :class="{ on: role === i }" @click="role = i">{{ r }}</button>
    </div>

    <div class="kpi">
      <div><b>{{ sum.count }}</b><span>รับวันนี้</span></div>
      <div><b>{{ baht(sum.revenue) }}</b><span>ยอดเงิน</span></div>
      <div :class="{ warn: orders.waiting.length }"><b>{{ orders.waiting.length }}</b><span>รอส่งมอบ</span></div>
    </div>

    <div class="grid">
      <button v-for="m in menus" :key="m.label" class="item" @click="router.push(m.to)">
        <span class="ic"><AppIcon :name="m.icon" :size="52" /><i v-if="m.badge" class="bd" :class="{ red: m.red }">{{ m.badge }}</i></span>
        <span class="lb">{{ m.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.top { background: var(--primary); color: #fff; padding: calc(10px + var(--safe-top)) 16px 10px; margin: 0 -16px; display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 10px; } .brand b { display: block; font-size: 17px; line-height: 1.1; font-weight: 500; } .brand small { opacity: .85; font-size: 12px; }
.logo { width: 34px; height: 34px; border-radius: 9px; background: var(--accent); display: grid; place-items: center; font-weight: 500; font-size: 19px; }
.bell { position: relative; border: 0; background: transparent; padding: 4px; line-height: 0; }
.bell i { position: absolute; top: 3px; right: 3px; width: 9px; height: 9px; border-radius: 50%; background: #ef4444; border: 1.5px solid var(--primary); }
.tabs { display: flex; margin: 0 -16px; background: var(--bg); }
.tabs button { flex: 1; border: 0; background: transparent; padding: 16px 0 12px; font-size: 16px; color: var(--muted); position: relative; }
.tabs button.on { color: var(--text); }
.tabs button.on::after { content: ''; position: absolute; left: 14%; right: 14%; bottom: 0; height: 3px; background: var(--accent); border-radius: 2px; }
.kpi { display: flex; margin: 8px 0 4px; background: #fff; border-radius: 10px; padding: 10px 0; }
.kpi > div { flex: 1; text-align: center; border-right: 1px solid var(--line); } .kpi > div:last-child { border: 0; }
.kpi b { display: block; font-size: 19px; font-weight: 500; color: var(--primary); } .kpi span { font-size: 12px; color: var(--muted); }
.kpi .warn b { color: var(--accent); }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px 4px; margin-top: 18px; }
.item { border: 0; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 2px; color: var(--text); }
.ic { position: relative; display: block; line-height: 0; }
.bd { position: absolute; top: -6px; right: -8px; background: var(--primary); color: #fff; font-style: normal; font-size: 11px; min-width: 20px; height: 20px; border-radius: 10px; display: grid; place-items: center; padding: 0 5px; line-height: 1; }
.bd.red { background: #ef4444; }
.lb { font-size: 13px; line-height: 1.25; text-align: center; color: #555b63; }
</style>
