<script setup>
// Home for franchise counter staff. Order follows how the shift is run: find a parcel → do the main job →
// see what needs attention → see where parcels are → reach every other service → check the latest parcels.
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

const today = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const count = (st) => orders.list.filter((o) => o.status === st).length

// Main operations — the four jobs done all day.
const main = computed(() => [
  { k: 'receive', icon: 'scan', label: 'รับพัสดุ', to: '/receive', primary: true },
  { k: 'shop', icon: 'box', label: 'พัสดุในร้าน', to: '/shop', n: orders.waiting.length },
  { k: 'handover', icon: 'truck', label: 'ส่งมอบขนส่ง', to: '/shop?select=all' },
  { k: 'search', icon: 'search', label: 'ค้นหาพัสดุ', to: '/search' },
])
// Every other service, in one 5 × 2 grid so all menus stay one tap away.
const services = computed(() => [
  { k: 'transit', icon: 'route', label: 'กำลังขนส่ง', to: '/search?filter=in_transit' },
  { k: 'm-overdue', icon: 'clock', label: 'ค้างเกิน 24 ชม.', to: '/shop?filter=overdue', n: orders.overdue.length, alert: true },
  { k: 'cancelled', icon: 'filex', label: 'รายการยกเลิก', to: '/search?filter=cancelled' },
  { k: 'reprint', icon: 'printer', label: 'ใบปะหน้าซ้ำ', to: '/search?label=1' },
  { k: 'void', icon: 'ban', label: 'ยกเลิกพัสดุ', to: '/search?filter=received&void=1' },
  { k: 'quote', icon: 'calc', label: 'เช็คราคา', to: '/quote' },
  { k: 'credit', icon: 'wallet', label: 'เช็คเครดิต', to: '/credit' },
  { k: 'issue', icon: 'flag', label: 'แจ้งปัญหา', to: '/issues', n: openIssues.value },
  { k: 'm-news', icon: 'news', label: 'ข่าวสาร', to: '/news', n: unreadCount() },
  { k: 'settings', icon: 'gear', label: 'ตั้งค่า', to: '/settings' },
])
// Needs attention now — only rows with something to do.
const todo = computed(() => [
  { k: 'overdue', tone: 'red', title: 'พัสดุค้างในร้านเกิน 24 ชม.', sub: 'ส่งมอบขนส่งโดยเร็ว', n: orders.overdue.length, to: '/shop?filter=overdue' },
  { k: 'waiting', tone: 'amber', title: 'รอส่งมอบให้ขนส่ง', sub: 'รับฝากแล้ว ยังอยู่ที่ร้าน', n: orders.waiting.length, to: '/shop' },
  { k: 'issues', tone: 'violet', title: 'แจ้งปัญหารอดำเนินการ', sub: 'ส่งให้สำนักงานใหญ่แล้ว', n: openIssues.value, to: '/issues' },
  { k: 'news', tone: 'blue', title: 'ประกาศใหม่ยังไม่ได้อ่าน', sub: 'จากสำนักงานใหญ่', n: unreadCount(), to: '/news' },
].filter((t) => t.n > 0))
const pipeline = computed(() => ['received', 'handed_over', 'in_transit', 'out_for_delivery', 'delivered'].map((s) => ({ s, n: count(s), label: STATUS[s].short, color: STATUS[s].color })))
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
        <input id="home-search" v-model="q" inputmode="search" enterkeyhint="search" placeholder="ค้นหาเลขพัสดุ ชื่อ หรือเบอร์โทร" />
        <button type="button" class="scanb" aria-label="สแกนบาร์โค้ด" @click="scan"><LineIcon name="scan" :size="22" /></button>
      </form>
    </section>

    <!-- main operations: the one raised surface on the page -->
    <nav class="main" aria-label="งานหลัก">
      <button v-for="m in main" :key="m.k" class="mt" :class="{ primary: m.primary }" :data-k="m.k" @click="router.push(m.to)">
        <span class="sq"><LineIcon :name="m.icon" :size="26" /><i v-if="m.n" class="bd">{{ m.n }}</i></span>
        <span class="lb">{{ m.label }}</span>
      </button>
    </nav>

    <section v-if="todo.length" class="sec">
      <h2>งานที่ต้องทำ</h2>
      <div class="list">
        <button v-for="t in todo" :key="t.k" class="todo" :class="t.tone" :data-k="t.k" @click="router.push(t.to)">
          <span class="tx"><b>{{ t.title }}</b><small>{{ t.sub }}</small></span>
          <span class="cnt" data-n>{{ t.n }}</span>
          <LineIcon name="chevron" :size="18" class="chev" />
        </button>
      </div>
    </section>

    <section class="sec">
      <div class="hrow"><h2>สถานะพัสดุ</h2><RouterLink to="/search" class="more">ดูทั้งหมด</RouterLink></div>
      <div class="pipe">
        <button v-for="p in pipeline" :key="p.s" class="step" :class="p.color" :data-k="'st-' + p.s" @click="router.push(`/search?filter=${p.s}`)">
          <span class="num">{{ p.n }}</span><span class="lab">{{ p.label }}</span>
        </button>
      </div>
    </section>

    <section class="sec">
      <h2>บริการและเครื่องมือ</h2>
      <div class="svc">
        <button v-for="s in services" :key="s.k" :data-k="s.k" @click="router.push(s.to)">
          <span class="sq" :class="{ alert: s.alert && s.n }"><LineIcon :name="s.icon" :size="22" /><i v-if="s.n" class="bd" :class="{ red: s.alert }">{{ s.n }}</i></span>
          <span class="lb">{{ s.label }}</span>
        </button>
      </div>
    </section>

    <section class="sec">
      <div class="hrow"><h2>รายการล่าสุด</h2><RouterLink to="/search" class="more">ดูทั้งหมด</RouterLink></div>
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
.brand { display: flex; align-items: center; gap: 10px; } .brand b { display: block; font-family: var(--font-head); font-size: 18px; line-height: 1.15; font-weight: 500; } .brand b span { color: #7FEEFF; } .brand small { opacity: .85; font-size: 12px; }
.bell { position: relative; border: 0; background: transparent; color: #fff; padding: 8px; line-height: 0; margin-right: -6px; }
.bell i { position: absolute; top: 7px; right: 7px; width: 9px; height: 9px; border-radius: 50%; background: #ef4444; border: 1.5px solid var(--primary); }
.hero { background: var(--primary); margin: 0 -16px; padding: 2px 16px 58px; color: #fff; }
.date { font-size: 12px; opacity: .85; margin-bottom: 8px; }
.sbox { display: flex; align-items: center; gap: 8px; background: #fff; color: var(--muted); border-radius: 12px; padding: 0 6px 0 14px; height: 50px; }
.sbox input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 15px; color: var(--text); height: 100%; }
.sbox:focus-within { box-shadow: 0 0 0 3px rgba(127, 238, 255, .55); }
.scanb { border: 0; background: var(--primary-soft); color: var(--primary); width: 42px; height: 40px; border-radius: 9px; display: grid; place-items: center; }

/* main operations */
.main { margin-top: -42px; position: relative; background: #fff; border-radius: 14px; box-shadow: 0 8px 22px rgba(15, 35, 80, .12); padding: 14px 6px 12px; display: grid; grid-template-columns: repeat(4, 1fr); }
.mt { border: 0; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 8px; font: inherit; color: var(--text); padding: 0 2px; }
.mt .sq { width: 54px; height: 54px; border-radius: 16px; background: #eef4ff; color: var(--primary); }
.mt.primary .sq { background: linear-gradient(135deg, #0066FF, #0044CC); color: #fff; box-shadow: 0 4px 10px rgba(0, 102, 255, .3); }
.mt .lb { font-size: 13px; font-weight: 500; }

.sq { position: relative; display: grid; place-items: center; flex: none; }
.bd { position: absolute; top: -6px; right: -8px; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 10px; background: var(--primary); color: #fff; font-style: normal; font-size: 11px; display: grid; place-items: center; line-height: 1; border: 2px solid #fff; box-sizing: content-box; }
.bd.red { background: #dc2626; }
.lb { text-align: center; line-height: 1.25; }

.sec { margin-top: 20px; }
.sec h2 { margin: 0 0 8px; font-family: var(--font-head); font-size: 15px; font-weight: 500; color: var(--text); }
.hrow { display: flex; align-items: center; justify-content: space-between; } .hrow h2 { margin-bottom: 8px; }
.more { color: var(--primary); font-size: 13px; text-decoration: none; padding: 14px 0 14px 14px; margin: -14px 0 -6px; }
.list { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid var(--line); }

/* needs attention: severity stripe + count */
.todo { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 12px 12px 16px; border: 0; border-bottom: 1px solid var(--line); background: transparent; text-align: left; font: inherit; color: inherit; position: relative; min-height: 58px; }
.todo:last-child { border-bottom: 0; } .todo::before { content: ''; position: absolute; left: 0; top: 10px; bottom: 10px; width: 4px; border-radius: 0 3px 3px 0; background: var(--tone); }
.todo.red { --tone: #dc2626; } .todo.amber { --tone: #d97706; } .todo.violet { --tone: #7c3aed; } .todo.blue { --tone: #2563eb; }
.cnt { min-width: 30px; height: 26px; border-radius: 13px; padding: 0 9px; display: grid; place-items: center; background: var(--tone); color: #fff; font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; }
.chev { color: #b5bac1; flex: none; }
.tx { flex: 1; min-width: 0; } .tx b { display: block; font-weight: 500; font-size: 14px; } .tx small { display: block; color: var(--muted); font-size: 12px; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* parcel pipeline */
.pipe { display: grid; grid-template-columns: repeat(5, 1fr); background: #fff; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.step { position: relative; border: 0; border-right: 1px solid var(--line); background: transparent; padding: 13px 2px 10px; display: flex; flex-direction: column; align-items: center; gap: 2px; font: inherit; color: inherit; }
.step:last-child { border-right: 0; } .step::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: var(--c, #cbd5e1); }
.step.amber { --c: #f59e0b; } .step.blue { --c: #3b82f6; } .step.violet { --c: #8b5cf6; } .step.green { --c: #22c55e; }
.num { font-family: var(--font-head); font-size: 22px; font-weight: 500; line-height: 1.1; font-variant-numeric: tabular-nums; } .lab { font-size: 11px; color: var(--muted); line-height: 1.2; text-align: center; }

/* services 5 × 2 */
.svc { display: grid; grid-template-columns: repeat(5, 1fr); row-gap: 16px; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 16px 4px 14px; }
.svc button { border: 0; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 7px; font: inherit; color: var(--text); padding: 0 2px; min-width: 0; }
.svc .sq { width: 46px; height: 46px; border-radius: 14px; background: #f1f5fc; color: #1e4fa8; }
.svc .sq.alert { background: #fdecec; color: #c42020; }
.svc .lb { font-size: 12px; }

/* recent */
.rec { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px; text-decoration: none; color: inherit; border-bottom: 1px solid var(--line); min-height: 60px; }
.rec:last-child { border-bottom: 0; } .rec img { width: 44px; height: 22px; object-fit: contain; flex: none; }
.no { letter-spacing: .3px; font-variant-numeric: tabular-nums; } .rt { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex: none; } .rt small { font-size: 11px; color: var(--muted); }
.rec :deep(.badge) { font-size: 11px; padding: 2px 8px; }
button:focus-visible, a:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 10px; }
</style>
