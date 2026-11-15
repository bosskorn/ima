<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LineIcon from '../components/LineIcon.vue'
import BrandLogo from '../components/BrandLogo.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { listIssues } from '../api'
import { unreadCount } from '../utils/news'
import { scanBarcode } from '../utils/scanner'
import { toast } from '../utils/toast'
import { timeAgo } from '../utils/format'
import { CARRIERS, STATUS } from '../data/constants'

const orders = useOrders(); const session = useSession(); const router = useRouter()
const openIssues = ref(0); const q = ref('')
onMounted(async () => { orders.load(); openIssues.value = (await listIssues()).filter((i) => i.status !== 'resolved').length })

const today = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })
const count = (st) => orders.list.filter((o) => o.status === st).length

// What the counter staff must act on now. Rows with nothing to do are hidden.
const todo = computed(() => [
  { k: 'overdue', icon: 'alert', tone: 'red', title: 'พัสดุค้างในร้านเกิน 24 ชม.', sub: 'ต้องส่งมอบขนส่งโดยเร็ว', n: orders.overdue.length, to: '/shop?filter=overdue' },
  { k: 'waiting', icon: 'box', tone: 'amber', title: 'รอส่งมอบให้ขนส่ง', sub: 'พัสดุที่รับฝากแล้วและยังอยู่ที่ร้าน', n: orders.waiting.length, to: '/shop' },
  { k: 'issues', icon: 'flag', tone: 'violet', title: 'เรื่องแจ้งปัญหาที่รอดำเนินการ', sub: 'ส่งให้สำนักงานใหญ่แล้ว', n: openIssues.value, to: '/issues' },
  { k: 'news', icon: 'news', tone: 'blue', title: 'ประกาศใหม่จากสำนักงานใหญ่', sub: 'ยังไม่ได้อ่าน', n: unreadCount(), to: '/news' },
].filter((t) => t.n > 0))

// Parcel pipeline, left to right.
const pipeline = computed(() => ['received', 'handed_over', 'in_transit', 'out_for_delivery', 'delivered'].map((s) => ({ s, n: count(s), label: STATUS[s].short, color: STATUS[s].color })))

const tools = [
  { k: 'quote', icon: 'calc', label: 'เช็คราคา', to: '/quote' },
  { k: 'credit', icon: 'wallet', label: 'เช็คเครดิต', to: '/credit' },
  { k: 'reprint', icon: 'printer', label: 'พิมพ์ซ้ำ', to: '/search?label=1' },
  { k: 'void', icon: 'ban', label: 'ยกเลิก', to: '/search?filter=received&void=1' },
  { k: 'issue', icon: 'flag', label: 'แจ้งปัญหา', to: '/issues' },
]
const recent = computed(() => orders.list.slice(0, 5))
const carrier = (o) => CARRIERS.find((c) => c.id === o.carrier)

function search() { router.push({ path: '/search', query: q.value.trim() ? { q: q.value.trim() } : {} }) }
async function scan() {
  try { const v = await scanBarcode(); if (v) router.push({ path: '/search', query: { q: v } }); else toast('สแกนด้วยกล้องใช้ได้ในแอปมือถือ — หรือพิมพ์เลขพัสดุแทน') } catch (e) { toast(e.message) }
}
</script>

<template>
  <div class="page">
    <header class="top">
      <div class="brand"><BrandLogo variant="white" :size="36" /><div><b>Send<span>Dee</span></b><small>{{ session.branch }} · {{ session.name }}</small></div></div>
      <button class="bell" aria-label="ข่าวสาร" @click="router.push('/news')"><LineIcon name="bell" :size="24" /><i v-if="unreadCount()" /></button>
    </header>

    <section class="hero">
      <div class="date">{{ today }}</div>
      <form class="sbox" @submit.prevent="search">
        <LineIcon name="search" :size="20" />
        <input v-model="q" inputmode="search" enterkeyhint="search" placeholder="ค้นหาเลขพัสดุ ชื่อ หรือเบอร์โทร" />
        <button type="button" class="scanb" aria-label="สแกนบาร์โค้ด" @click="scan"><LineIcon name="scan" :size="22" /></button>
      </form>
    </section>

    <!-- primary actions -->
    <section class="act card">
      <button class="a1" data-k="receive" @click="router.push('/receive')"><LineIcon name="scan" :size="26" /><span><b>รับพัสดุ</b><small>สแกน · กรอก · พิมพ์</small></span></button>
      <button class="a2" data-k="handover" @click="router.push('/shop?select=all')"><LineIcon name="truck" :size="26" /><span><b>ส่งมอบขนส่ง</b><small>{{ orders.waiting.length }} ชิ้นรออยู่</small></span></button>
    </section>

    <!-- to-do -->
    <section class="blk">
      <h3>งานที่ต้องทำ</h3>
      <div v-if="todo.length" class="list">
        <button v-for="t in todo" :key="t.k" class="row2" :data-k="t.k" @click="router.push(t.to)">
          <span class="ic" :class="t.tone"><LineIcon :name="t.icon" :size="20" /></span>
          <span class="tx"><b>{{ t.title }}</b><small>{{ t.sub }}</small></span>
          <span class="cnt" :class="t.tone" data-n>{{ t.n }}</span>
          <LineIcon name="chevron" :size="18" class="chev" />
        </button>
      </div>
      <div v-else class="clear"><LineIcon name="check" :size="20" /> ไม่มีงานค้าง</div>
    </section>

    <!-- pipeline -->
    <section class="blk">
      <div class="row between"><h3>สถานะพัสดุ</h3><RouterLink to="/search" class="more">ดูทั้งหมด</RouterLink></div>
      <div class="pipe">
        <button v-for="(p, i) in pipeline" :key="p.s" class="step" :class="p.color" :data-k="'st-' + p.s" @click="router.push(`/search?filter=${p.s}`)">
          <span class="num">{{ p.n }}</span><span class="lab">{{ p.label }}</span><i v-if="i < pipeline.length - 1" class="arrow" />
        </button>
      </div>
    </section>

    <!-- tools -->
    <section class="blk">
      <h3>เครื่องมือ</h3>
      <div class="tools">
        <button v-for="t in tools" :key="t.k" :data-k="t.k" @click="router.push(t.to)"><span><LineIcon :name="t.icon" :size="22" /></span>{{ t.label }}</button>
      </div>
    </section>

    <!-- recent -->
    <section class="blk">
      <div class="row between"><h3>รายการล่าสุด</h3><RouterLink to="/search" class="more">ดูทั้งหมด</RouterLink></div>
      <div class="list">
        <RouterLink v-for="o in recent" :key="o.id" :to="`/orders/${o.id}`" class="rec" data-k="recent">
          <img v-if="carrier(o)" :src="carrier(o).logo" :alt="carrier(o).name" />
          <span class="tx"><b class="no">{{ o.trackingNo }}</b><small>{{ o.receiver.name }} · {{ o.receiver.province }}</small></span>
          <span class="rt"><StatusBadge :status="o.status" short /><small>{{ timeAgo(o.createdAt) }}</small></span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.top { position: sticky; top: 0; z-index: 15; background: var(--primary); color: #fff; padding: calc(10px + var(--safe-top)) 16px 8px; margin: 0 -16px; display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 10px; } .brand b { display: block; font-size: 17px; line-height: 1.1; font-weight: 500; } .brand b span { color: #7FEEFF; } .brand small { opacity: .85; font-size: 12px; }
.bell { position: relative; border: 0; background: transparent; color: #fff; padding: 8px; line-height: 0; margin-right: -6px; }
.bell i { position: absolute; top: 7px; right: 7px; width: 9px; height: 9px; border-radius: 50%; background: #ef4444; border: 1.5px solid var(--primary); }
.hero { background: var(--primary); margin: 0 -16px; padding: 2px 16px 54px; color: #fff; }
.date { font-size: 12px; opacity: .85; margin-bottom: 8px; }
.sbox { display: flex; align-items: center; gap: 8px; background: #fff; color: var(--muted); border-radius: 12px; padding: 0 6px 0 14px; height: 50px; }
.sbox input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 15px; color: var(--text); height: 100%; }
.scanb { border: 0; background: var(--primary-soft); color: var(--primary); width: 40px; height: 38px; border-radius: 9px; display: grid; place-items: center; }
.act { margin: -38px 0 0; padding: 8px; display: grid; grid-template-columns: 1.15fr 1fr; gap: 8px; position: relative; box-shadow: 0 6px 18px rgba(15,23,42,.1); border: 0; }
.act button { border: 0; border-radius: 10px; display: flex; align-items: center; gap: 10px; padding: 14px 12px; text-align: left; font: inherit; min-height: 64px; }
.act b { display: block; font-size: 16px; font-weight: 500; line-height: 1.2; } .act small { display: block; font-size: 11.5px; opacity: .85; margin-top: 2px; }
.a1 { background: linear-gradient(135deg, #0066FF, #0044CC); color: #fff; } .a2 { background: #eef4ff; color: var(--primary-dark); }
.blk { margin-top: 18px; } .blk h3 { margin: 0 0 8px; font-size: 15px; font-weight: 500; color: var(--text); }
.more { color: var(--primary); font-size: 13px; text-decoration: none; padding: 14px 0 14px 14px; margin: -14px 0; }
.list { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid var(--line); }
.row2, .rec { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 0; background: transparent; text-align: left; font: inherit; color: inherit; text-decoration: none; border-bottom: 1px solid var(--line); min-height: 60px; }
.row2:last-child, .rec:last-child { border-bottom: 0; }
.tx { flex: 1; min-width: 0; } .tx b { display: block; font-weight: 500; font-size: 14px; } .tx small { display: block; color: var(--muted); font-size: 12px; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ic { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; flex: none; }
.ic.red { background: #fee2e2; color: #dc2626; } .ic.amber { background: #fef3c7; color: #b45309; } .ic.violet { background: #ede9fe; color: #6d28d9; } .ic.blue { background: #dbeafe; color: #1d4ed8; }
.cnt { min-width: 28px; height: 26px; border-radius: 13px; display: grid; place-items: center; padding: 0 8px; font-size: 13px; font-weight: 500; color: #fff; } .cnt.red { background: #dc2626; } .cnt.amber { background: #d97706; } .cnt.violet { background: #7c3aed; } .cnt.blue { background: #2563eb; }
.chev { color: #b5bac1; flex: none; }
.clear { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 16px; color: #059669; display: flex; align-items: center; justify-content: center; gap: 8px; }
.pipe { display: grid; grid-template-columns: repeat(5, 1fr); background: #fff; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.step { position: relative; border: 0; border-right: 1px solid var(--line); background: transparent; padding: 12px 2px 10px; display: flex; flex-direction: column; align-items: center; gap: 2px; font: inherit; color: inherit; }
.step:last-child { border-right: 0; } .step::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: var(--c, #cbd5e1); }
.step.amber { --c: #f59e0b; } .step.blue { --c: #3b82f6; } .step.violet { --c: #8b5cf6; } .step.green { --c: #22c55e; }
.num { font-size: 22px; font-weight: 500; line-height: 1.1; font-variant-numeric: tabular-nums; } .lab { font-size: 11px; color: var(--muted); line-height: 1.2; text-align: center; }
.tools { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.tools button { border: 0; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 6px; font: inherit; font-size: 12px; color: var(--text); padding: 2px 0; line-height: 1.2; }
.tools span { width: 48px; height: 48px; border-radius: 14px; background: #fff; border: 1px solid var(--line); color: var(--primary); display: grid; place-items: center; }
.rec img { width: 44px; height: 22px; object-fit: contain; flex: none; }
.no { letter-spacing: .3px; font-variant-numeric: tabular-nums; } .rt { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex: none; } .rt small { font-size: 11px; color: var(--muted); }
.rec :deep(.badge) { font-size: 11px; padding: 2px 8px; }
</style>
