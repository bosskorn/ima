<script setup>
import { onMounted, computed } from 'vue'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { toast } from '../utils/toast'
import { baht } from '../utils/format'
import { PAYMENTS, SERVICES, COMMISSION_RATE } from '../data/constants'

const orders = useOrders(); const session = useSession()
onMounted(() => orders.load())
const s = computed(() => orders.summary)
const date = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const text = computed(() => [
  `📦 สรุปยอด Senddee ${session.branch}`, date, '',
  `รับพัสดุ ${s.value.count} ชิ้น (${s.value.weight.toFixed(1)} กก.) · ยกเลิก ${s.value.voided}`,
  ...PAYMENTS.map((p) => `${p.label}: ${baht(s.value.byPay[p.id] || 0)}`),
  `รวมรับเงิน: ${baht(s.value.revenue)}`,
  `ค้างส่งมอบขนส่ง: ${orders.waiting.length} ชิ้น`, `ผู้สรุป: ${session.name}`,
].join('\n'))
async function share() {
  if (navigator.share) { try { await navigator.share({ text: text.value }); return } catch {} }
  try { await navigator.clipboard.writeText(text.value); toast('คัดลอกสรุปแล้ว วางใน LINE ได้เลย') } catch { toast('คัดลอกไม่สำเร็จ') }
}
</script>

<template>
  <div class="page">
    <header class="hdr"><h1>สรุปยอดวันนี้</h1><p>{{ date }}</p></header>

    <div class="card hero"><span>รับเงินวันนี้</span><b>{{ baht(s.revenue) }}</b><small>{{ s.count }} ชิ้น · {{ s.weight.toFixed(1) }} กก.</small></div>

    <div class="card">
      <div class="bold" style="margin-bottom:6px">แยกตามการชำระเงิน</div>
      <div v-for="p in PAYMENTS" :key="p.id" class="kv"><span>{{ p.label }}</span><b>{{ baht(s.byPay[p.id] || 0) }}</b></div>
      <div class="kv total-line"><span>เงินสดที่ต้องมีในลิ้นชัก</span><span>{{ baht(s.byPay.cash || 0) }}</span></div>
    </div>

    <div class="card">
      <div class="bold" style="margin-bottom:6px">แยกตามบริการ</div>
      <div v-for="v in SERVICES" :key="v.id" class="kv"><span>{{ v.name }}</span><b>{{ s.bySvc[v.id] || 0 }} ชิ้น</b></div>
      <div class="kv"><span>พัสดุ COD</span><b>{{ s.codCount }} ชิ้น</b></div>
      <div class="kv"><span>ยกเลิก (Void)</span><b>{{ s.voided }} ชิ้น</b></div>
    </div>

    <div class="card">
      <div class="kv"><span>ค่าคอมมิชชัน (ประมาณ {{ COMMISSION_RATE * 100 }}%)</span><b>{{ baht(s.commission) }}</b></div>
      <p class="muted">อัตราค่าคอมเป็นค่าสมมติ ปรับตามเงื่อนไขแฟรนไชส์จริงได้</p>
    </div>

    <RouterLink v-if="orders.waiting.length" to="/shop" class="alert">⚠️ ยังมีพัสดุรอส่งมอบ {{ orders.waiting.length }} ชิ้น ›</RouterLink>
    <button class="btn block" style="margin-top:12px" @click="share">ส่งสรุปเข้า LINE / แชร์</button>
  </div>
</template>

<style scoped>
.hdr { background: var(--primary); color: #fff; padding: calc(14px + var(--safe-top)) 16px 18px; margin: 0 -16px 14px; border-radius: 0 0 22px 22px; }
h1 { font-size: 19px; } .hdr p { font-size: 13px; opacity: .85; margin-top: 2px; }
.hero { display: flex; flex-direction: column; align-items: center; padding: 20px; } .hero span { color: var(--muted); } .hero b { font-size: 36px; color: var(--primary); } .hero small { color: var(--muted); }
.alert { display: block; margin-top: 12px; background: #fee2e2; color: #991b1b; border-radius: 12px; padding: 12px 14px; font-weight: 600; text-decoration: none; }
</style>
