<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import JsBarcode from 'jsbarcode'
import AppHeader from '../components/AppHeader.vue'
import BrandLogo from '../components/BrandLogo.vue'
import { getTx } from '../api'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { useReceive } from '../stores/receive'
import { toast } from '../utils/toast'
import { baht, fmtDT } from '../utils/format'
import { PAYMENTS, CARRIERS, COD_RATE } from '../data/constants'

const props = defineProps({ id: String })
const router = useRouter(); const orders = useOrders(); const session = useSession(); const rc = useReceive()
const tx = ref(null); const method = ref(session.defaultPayment); const busy = ref(false); const bc = ref(null)

async function refresh() { tx.value = await getTx(props.id) }
onMounted(async () => { await orders.load(); await refresh(); drawBc() })
function drawBc() { if (bc.value && tx.value) JsBarcode(bc.value, tx.value.id, { format: 'CODE128', height: 36, displayValue: false, margin: 0, width: 2 }) }

const items = computed(() => (tx.value ? tx.value.orderIds.map((id) => orders.list.find((o) => o.id === id)).filter(Boolean) : []))
const live = computed(() => items.value.filter((o) => o.status !== 'cancelled'))
const shipping = computed(() => live.value.reduce((a, o) => a + o.fee, 0))
const codFees = computed(() => live.value.reduce((a, o) => a + o.codFee, 0))
const total = computed(() => live.value.reduce((a, o) => a + o.payment.amount, 0))
const paid = computed(() => !!tx.value?.payment)
const payLabel = computed(() => PAYMENTS.find((p) => p.id === tx.value?.payment?.method)?.label)
const carrierOf = (o) => CARRIERS.find((c) => c.id === o.carrier)?.short

async function pay() {
  busy.value = true
  try { await orders.pay(tx.value.id, method.value); await refresh(); await new Promise((r) => setTimeout(r)); drawBc(); if (rc.txId === tx.value.id) rc.reset(); toast('บันทึกรับเงินแล้ว') }
  catch (e) { toast(e.message) } finally { busy.value = false }
}
const print = () => window.print()
function next() { router.replace('/receive') }
</script>

<template>
  <div v-if="tx" class="page">
    <AppHeader back :title="paid ? 'ใบเสร็จรับเงิน' : 'สรุปและรับเงิน'" :sub="tx.id" />

    <div class="blk">
      <div class="row between"><span class="muted">ผู้ส่ง</span><span>{{ tx.sender.name }} · {{ tx.sender.phone }}</span></div>
      <div class="row between" style="margin-top:4px"><span class="muted">จำนวน</span><span>{{ live.length }} ชิ้น</span></div>
    </div>

    <!-- payment step -->
    <div v-if="!paid" class="blk">
      <h4>รับเงินจากลูกค้า</h4>
      <div class="kv"><span>ค่าขนส่งรวม</span><span>{{ baht(shipping) }}</span></div>
      <div v-if="codFees" class="kv"><span>ค่าเก็บเงินปลายทาง {{ COD_RATE * 100 }}%</span><span>{{ baht(codFees) }}</span></div>
      <div class="kv tot"><span>ยอดที่ต้องรับ</span><span>{{ baht(total) }}</span></div>
      <div class="muted" style="margin:10px 0 6px">วิธีรับเงิน</div>
      <div class="chip-row"><button v-for="p in PAYMENTS" :key="p.id" class="chip" :class="{ on: method === p.id }" @click="method = p.id">{{ p.label }}</button></div>
      <button class="btn block" style="margin-top:14px" :disabled="busy || !live.length" @click="pay">{{ busy ? 'กำลังบันทึก…' : `ยืนยันรับเงิน ${baht(total)}` }}</button>
      <button class="btn ghost block" style="margin-top:8px" @click="router.push('/receive')">+ เพิ่มรายการพัสดุ</button>
    </div>

    <!-- printable receipt -->
    <div class="rcpt printable">
      <div class="top"><BrandLogo variant="print" :size="26" text sub="ใบเสร็จรับเงิน" /><span>{{ tx.id }}</span></div>
      <svg ref="bc" class="bc" />
      <div class="meta">{{ session.branch }} · โทร {{ session.branchPhone }}<br />{{ session.address }}<br />วันที่ {{ fmtDT(tx.at) }} · พนักงาน {{ tx.by }}</div>
      <div class="meta">ผู้ส่ง: {{ tx.sender.name }} ({{ tx.sender.phone }})</div>
      <table>
        <tr v-for="o in live" :key="o.id"><td>{{ o.trackingNo }}<small>{{ carrierOf(o) }} · {{ o.receiver.province }} · {{ o.parcel.weight }} กก.<template v-if="o.cod"> · COD {{ baht(o.cod) }}</template></small></td><td class="r">{{ baht(o.fee) }}<small v-if="o.codFee">+{{ baht(o.codFee) }}</small></td></tr>
      </table>
      <div class="sumr"><span>ค่าขนส่ง</span><span>{{ baht(shipping) }}</span></div>
      <div v-if="codFees" class="sumr"><span>ค่าเก็บเงินปลายทาง</span><span>{{ baht(codFees) }}</span></div>
      <div class="sumr big"><span>รวมทั้งสิ้น</span><span>{{ baht(total) }}</span></div>
      <div class="sumr"><span>ชำระโดย</span><span>{{ paid ? payLabel : 'ยังไม่ชำระ' }}</span></div>
      <p class="foot">ขอบคุณที่ใช้บริการ SendDee</p>
    </div>

    <div v-if="paid" class="stack" style="margin-top:14px">
      <button class="btn block" @click="print">🖨️ พิมพ์ใบเสร็จ</button>
      <button class="btn block ghost" @click="next">รับลูกค้าคนถัดไป</button>
      <button class="btn block soft" @click="router.replace('/')">กลับหน้าหลัก</button>
    </div>
  </div>
  <div v-else class="page"><AppHeader back title="ไม่พบใบเสร็จ" /></div>
</template>

<style scoped>
.blk { background: #fff; margin: 10px -16px 0; padding: 12px 16px; } .blk h4 { margin: 0 0 6px; font-size: 13px; color: var(--muted); font-weight: 400; }
.tot { border-top: 1px dashed var(--line); margin-top: 4px; padding-top: 8px !important; color: var(--primary); font-size: 18px; }
.rcpt { background: #fff; color: #000; border: 1px solid #000; margin: 12px 0 0; padding: 12px; font-size: 13px; }
.top { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; }
.bc { width: 100%; height: 36px; margin-top: 8px; } .meta { margin: 8px 0; color: #333; line-height: 1.5; }
table { width: 100%; border-collapse: collapse; } td { border-top: 1px dashed #999; padding: 6px 2px; vertical-align: top; } td small { display: block; color: #555; font-size: 11px; } .r { text-align: right; white-space: nowrap; }
.sumr { display: flex; justify-content: space-between; padding: 3px 0; } .sumr.big { font-size: 17px; border-top: 2px solid #000; margin-top: 6px; padding-top: 6px; }
.foot { text-align: center; margin-top: 12px; color: #555; font-size: 12px; }
</style>
