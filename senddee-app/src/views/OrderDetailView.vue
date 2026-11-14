<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import Timeline from '../components/Timeline.vue'
import LabelPreview from '../components/LabelPreview.vue'
import BottomSheet from '../components/BottomSheet.vue'
import { useOrders } from '../stores/orders'
import { toast } from '../utils/toast'
import { baht, fmtDT } from '../utils/format'
import { SERVICES, PAYMENTS, PARCEL_TYPES } from '../data/constants'
import { PROVINCES } from '../data/provinces'
import { calcFee } from '../api'
import { useSession } from '../stores/session'

const props = defineProps({ id: String })
const orders = useOrders()
const route = useRoute()
const labelOpen = ref(false)
onMounted(async () => { await orders.load(); if (route.query.label) labelOpen.value = true })
const o = computed(() => orders.byId(props.id))
const svc = computed(() => SERVICES.find((s) => s.id === o.value?.service))
const pay = computed(() => PAYMENTS.find((p) => p.id === o.value?.payment.method)?.label)
const session = useSession()
const voidOpen = ref(false)
const editOpen = ref(false)
const ef = ref(null)
const reason = ref('')
const reasons = ['ลูกค้าเปลี่ยนใจ', 'กรอกที่อยู่ผิด', 'น้ำหนัก/บริการผิด', 'สินค้าส่งไม่ได้']

async function copy() { try { await navigator.clipboard.writeText(o.value.trackingNo); toast('คัดลอกเลขพัสดุแล้ว') } catch { toast(o.value.trackingNo) } }
async function doVoid() {
  try { await orders.void(o.value.id, reason.value); voidOpen.value = false; toast('ยกเลิกแล้ว — คืนเงิน ' + baht(o.value.payment.amount) + ' ให้ลูกค้า', 3500) } catch (e) { toast(e.message) }
}
const print = () => window.print()
function openEdit() {
  const x = o.value
  ef.value = { name: x.receiver.name, phone: x.receiver.phone, address: x.receiver.address, province: x.receiver.province, postcode: x.receiver.postcode, weight: String(x.parcel.weight), type: x.parcel.type, note: x.parcel.note || '', service: x.service }
  editOpen.value = true
}
const newFee = computed(() => (ef.value ? calcFee({ weight: ef.value.weight, service: ef.value.service, cod: o.value.cod }).shipping : 0))
const feeDiff = computed(() => newFee.value - (o.value?.payment.amount || 0))
const efErr = computed(() => {
  const e = ef.value; if (!e) return ''
  if (e.name.trim().length < 2) return 'กรอกชื่อผู้รับ'
  if (!/^0\d{8,9}$/.test(e.phone)) return 'เบอร์โทรไม่ถูกต้อง'
  if (e.address.trim().length < 3) return 'กรอกที่อยู่'
  if (!/^\d{5}$/.test(e.postcode)) return 'รหัสไปรษณีย์ 5 หลัก'
  const w = Number(e.weight); if (!(w > 0) || w > 30) return 'น้ำหนักต้องมากกว่า 0 และไม่เกิน 30 กก.'
  return ''
})
async function saveEdit() {
  if (efErr.value) return toast(efErr.value)
  const e = ef.value
  try {
    const r = await orders.edit(o.value.id, { receiver: { name: e.name.trim(), phone: e.phone, address: e.address.trim(), province: e.province, postcode: e.postcode }, parcel: { weight: e.weight, type: e.type, note: e.note.trim() }, service: e.service })
    editOpen.value = false
    toast(r.diff > 0 ? `บันทึกแล้ว — เก็บเพิ่ม ${baht(r.diff)}` : r.diff < 0 ? `บันทึกแล้ว — คืนลูกค้า ${baht(-r.diff)}` : 'บันทึกแล้ว', 3500)
  } catch (err) { toast(err.message) }
}
async function share() {
  const x = o.value
  const text = `พัสดุ Senddee เลขที่ ${x.trackingNo} ส่งถึง ${x.receiver.name} (${x.receiver.province}) · ฝากส่งที่ ${session.branch} โทร ${session.branchPhone}`
  if (navigator.share) { try { await navigator.share({ title: 'Senddee', text }); return } catch {} }
  try { await navigator.clipboard.writeText(text); toast('คัดลอกข้อความแล้ว ส่งให้ลูกค้าทาง LINE/SMS ได้เลย') } catch { toast(text, 4000) }
}
async function copyAddr() {
  const r = o.value.receiver
  try { await navigator.clipboard.writeText(`${r.name} ${r.phone}\n${r.address} ${r.province} ${r.postcode}`); toast('คัดลอกที่อยู่แล้ว') } catch { toast('คัดลอกไม่สำเร็จ') }
}
</script>

<template>
  <div v-if="o" class="page">
    <AppHeader back :title="o.trackingNo" :sub="`${svc?.name} · รับโดย ${o.receivedBy.name}`" />

    <div class="card">
      <div class="row between"><StatusBadge :status="o.status" />
        <div class="row"><button class="btn soft sm" @click="copy">คัดลอกเลข</button><button class="btn soft sm" @click="labelOpen = true">ใบปะหน้า</button></div></div>
      <h3 class="section-title" style="margin-top:16px">ความคืบหน้า</h3>
      <Timeline :events="o.events" />
      <button v-if="['handed_over', 'in_transit', 'out_for_delivery'].includes(o.status)" class="btn ghost block" @click="orders.advance(o.id)">⏩ จำลองสถานะถัดไป (โหมดทดลอง)</button>
    </div>

    <div class="card">
      <div class="bold">ผู้รับ</div>
      <p>{{ o.receiver.name }}</p>
      <a class="tel" :href="`tel:${o.receiver.phone}`">📞 {{ o.receiver.phone }}</a>
      <p class="muted">{{ o.receiver.address }} {{ o.receiver.province }} {{ o.receiver.postcode }}</p>
      <button class="lnk" @click="copyAddr">คัดลอกที่อยู่</button>
      <hr />
      <div class="bold">ผู้ฝากส่ง</div>
      <p>{{ o.sender?.name || 'ลูกค้าหน้าร้าน' }} <span v-if="o.sender?.phone" class="muted">· {{ o.sender.phone }}</span></p>
    </div>

    <div class="card">
      <div class="kv"><span class="muted">ประเภท / น้ำหนัก</span><span>{{ o.parcel.type }} · {{ o.parcel.weight }} กก.</span></div>
      <div v-if="o.parcel.note" class="kv"><span class="muted">หมายเหตุ</span><span>{{ o.parcel.note }}</span></div>
      <div class="kv"><span class="muted">รับฝากเมื่อ</span><span>{{ fmtDT(o.createdAt) }}</span></div>
      <div v-if="o.handoverId" class="kv"><span class="muted">ใบส่งมอบ</span><span>{{ o.handoverId }}</span></div>
      <div v-if="o.cod" class="kv"><span class="muted">COD (เก็บปลายทาง)</span><span class="cod">{{ baht(o.cod) }}</span></div>
      <div v-if="o.codFee" class="kv"><span class="muted">ค่าธรรมเนียม COD (หักจากยอด COD)</span><span>{{ baht(o.codFee) }}</span></div>
      <div class="kv total-line"><span>รับเงินที่เคาน์เตอร์ ({{ pay }})</span><span>{{ baht(o.payment.amount) }}</span></div>
    </div>

    <div class="acts">
      <button class="btn ghost" @click="share">แชร์เลขพัสดุให้ลูกค้า</button>
      <button v-if="o.status === 'received'" class="btn ghost" @click="openEdit">แก้ไขข้อมูล</button>
    </div>
    <button v-if="o.status === 'received'" class="btn danger block" style="margin-top:10px" @click="voidOpen = true">ยกเลิกพัสดุ (Void)</button>

    <BottomSheet :open="editOpen" title="แก้ไขข้อมูลพัสดุ" @close="editOpen = false">
      <template v-if="ef">
        <label class="field"><span>ชื่อผู้รับ</span><input v-model="ef.name" /></label>
        <label class="field"><span>เบอร์โทร</span><input v-model="ef.phone" inputmode="tel" maxlength="10" /></label>
        <label class="field"><span>ที่อยู่</span><textarea v-model="ef.address" rows="2" /></label>
        <div class="grid2">
          <label class="field"><span>จังหวัด</span><select v-model="ef.province"><option v-for="p in PROVINCES" :key="p">{{ p }}</option></select></label>
          <label class="field"><span>รหัสไปรษณีย์</span><input v-model="ef.postcode" inputmode="numeric" maxlength="5" /></label>
        </div>
        <div class="grid2">
          <label class="field"><span>น้ำหนัก (กก.)</span><input v-model="ef.weight" inputmode="decimal" /></label>
          <label class="field"><span>ประเภท</span><select v-model="ef.type"><option v-for="t in PARCEL_TYPES" :key="t">{{ t }}</option></select></label>
        </div>
        <div class="chip-row" style="margin-bottom:12px"><button v-for="s in SERVICES" :key="s.id" class="chip" :class="{ on: ef.service === s.id }" @click="ef.service = s.id">{{ s.name }}</button></div>
        <div class="kv"><span class="muted">ค่าบริการใหม่</span><span>{{ baht(newFee) }}</span></div>
        <div v-if="feeDiff" class="kv" :style="{ color: feeDiff > 0 ? 'var(--accent)' : 'var(--primary)' }"><span>{{ feeDiff > 0 ? 'เก็บเพิ่มจากลูกค้า' : 'คืนเงินลูกค้า' }}</span><span>{{ baht(Math.abs(feeDiff)) }}</span></div>
      </template>
      <template #footer><button class="btn ghost" @click="editOpen = false">ยกเลิก</button><button class="btn accent" style="flex:1" @click="saveEdit">บันทึก</button></template>
    </BottomSheet>

    <BottomSheet :open="labelOpen" title="ใบปะหน้า" @close="labelOpen = false">
      <LabelPreview :order="o" />
      <template #footer><button class="btn block" @click="print">🖨️ พิมพ์ซ้ำ</button></template>
    </BottomSheet>
    <BottomSheet :open="voidOpen" title="ยกเลิกพัสดุ" @close="voidOpen = false">
      <p class="muted" style="margin-bottom:10px">ต้องคืนเงิน {{ baht(o.payment.amount) }} ให้ลูกค้า เลือกเหตุผล:</p>
      <div class="chip-row"><button v-for="r in reasons" :key="r" class="chip" :class="{ on: reason === r }" @click="reason = r">{{ r }}</button></div>
      <template #footer><button class="btn ghost" @click="voidOpen = false">ไม่ยกเลิก</button><button class="btn danger" style="flex:1" :disabled="!reason" @click="doVoid">ยืนยันยกเลิก</button></template>
    </BottomSheet>
  </div>
  <div v-else class="page"><AppHeader back title="ไม่พบพัสดุ" /></div>
</template>

<style scoped>
hr { border: 0; border-top: 1px solid var(--line); margin: 12px 0; } .tel { display: inline-block; color: var(--primary); font-weight: 500; text-decoration: none; margin: 4px 0; }
.lnk { border: 0; background: transparent; color: var(--primary); padding: 4px 0; font-size: 14px; }
.acts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; } .acts .btn:only-child { grid-column: 1 / -1; }
</style>
