<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import OrderCard from '../components/OrderCard.vue'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { calcFee } from '../api'
import { SERVICES } from '../data/constants'
import { baht } from '../utils/format'

const orders = useOrders()
const session = useSession()
const router = useRouter()
onMounted(() => orders.load())

const sum = computed(() => orders.summary)
const w = ref('')
const prices = computed(() => (Number(w.value) > 0 ? SERVICES.map((s) => ({ ...s, price: calcFee({ weight: w.value, service: s.id }).shipping })) : []))
const todayList = computed(() => orders.today.slice(0, 5))
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'สวัสดีตอนเช้า' : h < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น' })
</script>

<template>
  <div class="page">
    <header class="hdr">
      <div class="grow"><small>{{ greeting }}</small><h1>{{ session.name }}</h1><p>{{ session.branch }}</p></div>
      <button class="avatar" @click="router.push('/settings')" aria-label="ตั้งค่า">{{ session.name.slice(0, 1) }}</button>
    </header>

    <button class="cta" @click="router.push('/receive')">
      <span class="cta-ic"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/></svg></span>
      <span class="grow"><b>รับพัสดุจากลูกค้า</b><small>วางที่อยู่ ชั่งน้ำหนัก รับเงิน พิมพ์ใบปะหน้า</small></span>
      <span class="arrow">›</span>
    </button>

    <div class="kpis">
      <div class="card k"><b>{{ sum.count }}</b><span>รับวันนี้ (ชิ้น)</span></div>
      <div class="card k"><b>{{ baht(sum.revenue) }}</b><span>ยอดรับเงิน</span></div>
      <RouterLink to="/shop" class="card k warn" :class="{ none: !orders.waiting.length }"><b>{{ orders.waiting.length }}</b><span>รอส่งมอบขนส่ง</span></RouterLink>
      <div class="card k"><b>{{ baht(sum.commission) }}</b><span>ค่าคอม (ประมาณ)</span></div>
    </div>

    <RouterLink v-if="orders.overdue.length" to="/shop" class="alert">
      ⚠️ มีพัสดุค้างในร้านเกิน 24 ชม. {{ orders.overdue.length }} ชิ้น — รีบส่งมอบขนส่ง ›
    </RouterLink>

    <div class="card quote">
      <div class="bold">เช็คราคาให้ลูกค้า</div>
      <div class="row" style="margin-top:8px"><input v-model="w" inputmode="decimal" placeholder="น้ำหนัก (กก.)" /><span class="muted">กก.</span></div>
      <div v-if="prices.length" class="plist">
        <div v-for="p in prices" :key="p.id"><span>{{ p.name }} <small class="muted">{{ p.eta }}</small></span><b>{{ baht(p.price) }}</b></div>
      </div>
    </div>

    <div class="row between"><h2 class="section-title">รับล่าสุดวันนี้</h2><RouterLink to="/search" class="more">ดูทั้งหมด</RouterLink></div>
    <OrderCard v-for="o in todayList" :key="o.id" :order="o" />
    <p v-if="!todayList.length" class="muted" style="text-align:center;margin-top:20px">ยังไม่มีพัสดุที่รับวันนี้</p>
  </div>
</template>

<style scoped>
.hdr { background: var(--primary); color: #fff; padding: calc(14px + var(--safe-top)) 16px 26px; margin: 0 -16px; border-radius: 0 0 22px 22px; display: flex; align-items: center; gap: 10px; }
.hdr small { opacity: .8; } h1 { font-size: 21px; } .hdr p { font-size: 13px; opacity: .85; } .grow { flex: 1; min-width: 0; }
.avatar { width: 42px; height: 42px; border-radius: 50%; border: 0; background: rgba(255,255,255,.2); color: #fff; font-size: 18px; font-weight: 500; }
.cta { width: calc(100% - 0px); margin-top: -16px; border: 0; background: var(--accent); color: #fff; border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 12px; text-align: left; position: relative; }
.cta b { font-size: 17px; display: block; } .cta small { opacity: .92; font-size: 12px; }
.cta-ic { width: 48px; height: 48px; border-radius: 8px; background: rgba(255,255,255,.22); display: grid; place-items: center; flex: none; } .arrow { font-size: 28px; }
.kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.k { margin: 0 !important; display: flex; flex-direction: column; gap: 2px; text-decoration: none; color: inherit; }
.k b { font-size: 22px; color: var(--primary); } .k span { font-size: 12px; color: var(--muted); }
.k.warn { border: 2px solid var(--accent); } .k.warn b { color: var(--accent); } .k.warn.none { border-color: transparent; } .k.warn.none b { color: var(--primary); }
.alert { display: block; margin-top: 12px; background: #fee2e2; color: #991b1b; border-radius: 8px; padding: 12px 14px; font-weight: 500; font-size: 14px; text-decoration: none; }
.quote { margin-top: 14px; } .quote input { flex: 1; padding: 11px 14px; border: 1.5px solid var(--line); border-radius: 8px; min-width: 0; }
.plist { margin-top: 10px; } .plist > div { display: flex; justify-content: space-between; padding: 6px 0; border-top: 1px solid var(--line); } .plist b { color: var(--primary); }
.more { color: var(--primary); font-size: 13px; text-decoration: none; font-weight: 500; }
</style>
