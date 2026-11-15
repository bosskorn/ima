<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import JsBarcode from 'jsbarcode'
import AppHeader from '../components/AppHeader.vue'
import BrandLogo from '../components/BrandLogo.vue'
import { getTx, findSender } from '../api'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { useReceive } from '../stores/receive'
import { baht, fmtDT } from '../utils/format'
import { CARRIERS, COD_RATE } from '../data/constants'

const props = defineProps({ id: String })
const router = useRouter(); const orders = useOrders(); const session = useSession(); const rc = useReceive()
const tx = ref(null); const credit = ref(null); const bc = ref(null)

onMounted(async () => {
  await orders.load()
  const t = await getTx(props.id)
  if (t) credit.value = (await findSender(t.sender.phone))?.credit ?? 0
  tx.value = t
  if (rc.txId === props.id) rc.reset() // this customer visit is finished
  await new Promise((r) => setTimeout(r))
  if (bc.value && tx.value) JsBarcode(bc.value, tx.value.id, { format: 'CODE128', height: 36, displayValue: false, margin: 0, width: 2 })
})

const items = computed(() => (tx.value ? tx.value.orderIds.map((id) => orders.list.find((o) => o.id === id)).filter(Boolean) : []))
const live = computed(() => items.value.filter((o) => o.status !== 'cancelled'))
const shipping = computed(() => live.value.reduce((a, o) => a + o.fee, 0))
const codFees = computed(() => live.value.reduce((a, o) => a + o.codFee, 0))
const total = computed(() => live.value.reduce((a, o) => a + o.charge, 0))
const carrierOf = (o) => CARRIERS.find((c) => c.id === o.carrier)?.short
const print = () => window.print()
</script>

<template>
  <div v-if="tx" class="page">
    <AppHeader back title="ใบเสร็จ" :sub="tx.id" />
    <div class="done"><div class="tick">✓</div><div>สร้างออเดอร์ {{ live.length }} ชิ้นเรียบร้อย</div><small class="muted">หักค่าบริการจากเครดิตผู้ส่งแล้ว</small></div>

    <div class="rcpt printable">
      <div class="top"><BrandLogo variant="print" :size="26" text sub="ใบเสร็จ" /><span>{{ tx.id }}</span></div>
      <svg ref="bc" class="bc" />
      <div class="meta">{{ session.branch }} · โทร {{ session.branchPhone }}<br />{{ session.address }}<br />วันที่ {{ fmtDT(tx.at) }} · พนักงาน {{ tx.by }}</div>
      <div class="meta">ผู้ส่ง: {{ tx.sender.name }} ({{ tx.sender.phone }})</div>
      <table>
        <tr v-for="o in live" :key="o.id"><td>{{ o.trackingNo }}<small>{{ carrierOf(o) }} · {{ o.receiver.province }} · {{ o.parcel.weight }} กก.<template v-if="o.cod"> · COD {{ baht(o.cod) }}</template></small></td><td class="r">{{ baht(o.fee) }}<small v-if="o.codFee">+{{ baht(o.codFee) }}</small></td></tr>
      </table>
      <div class="sumr"><span>ค่าขนส่ง</span><span>{{ baht(shipping) }}</span></div>
      <div v-if="codFees" class="sumr"><span>ค่าเก็บเงินปลายทาง {{ COD_RATE * 100 }}%</span><span>{{ baht(codFees) }}</span></div>
      <div class="sumr big"><span>หักเครดิตรวม</span><span>{{ baht(total) }}</span></div>
      <div v-if="credit !== null" class="sumr"><span>เครดิตคงเหลือ</span><span>{{ baht(credit) }}</span></div>
      <p class="foot">ขอบคุณที่ใช้บริการ SendDee</p>
    </div>

    <div class="stack" style="margin-top:14px">
      <button class="btn block" @click="print">🖨️ พิมพ์ใบเสร็จ</button>
      <button class="btn block ghost" @click="router.replace('/receive')">รับลูกค้าคนถัดไป</button>
      <button class="btn block soft" @click="router.replace('/')">กลับหน้าหลัก</button>
    </div>
  </div>
  <div v-else class="page"><AppHeader back title="ไม่พบใบเสร็จ" /></div>
</template>

<style scoped>
.done { text-align: center; padding: 8px 0 4px; } .tick { width: 52px; height: 52px; border-radius: 50%; background: #16a34a; color: #fff; font-size: 30px; display: grid; place-items: center; margin: 0 auto 8px; }
.rcpt { background: #fff; color: #000; border: 1px solid #000; margin: 12px 0 0; padding: 12px; font-size: 13px; }
.top { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; }
.bc { width: 100%; height: 36px; margin-top: 8px; } .meta { margin: 8px 0; color: #333; line-height: 1.5; }
table { width: 100%; border-collapse: collapse; } td { border-top: 1px dashed #999; padding: 6px 2px; vertical-align: top; } td small { display: block; color: #555; font-size: 11px; } .r { text-align: right; white-space: nowrap; }
.sumr { display: flex; justify-content: space-between; padding: 3px 0; } .sumr.big { font-size: 17px; border-top: 2px solid #000; margin-top: 6px; padding-top: 6px; }
.foot { text-align: center; margin-top: 12px; color: #555; font-size: 12px; }
</style>
