<script setup>
import { onMounted, ref, computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import Timeline from '../components/Timeline.vue'
import LabelPreview from '../components/LabelPreview.vue'
import BottomSheet from '../components/BottomSheet.vue'
import { useOrders } from '../stores/orders'
import { toast } from '../utils/toast'
import { baht, fmtDT } from '../utils/format'
import { SERVICES, PAYMENTS } from '../data/constants'

const props = defineProps({ id: String })
const orders = useOrders()
onMounted(() => orders.load())
const o = computed(() => orders.byId(props.id))
const svc = computed(() => SERVICES.find((s) => s.id === o.value?.service))
const pay = computed(() => PAYMENTS.find((p) => p.id === o.value?.payment.method)?.label)
const labelOpen = ref(false)
const voidOpen = ref(false)
const reason = ref('')
const reasons = ['ลูกค้าเปลี่ยนใจ', 'กรอกที่อยู่ผิด', 'น้ำหนัก/บริการผิด', 'สินค้าส่งไม่ได้']

async function copy() { try { await navigator.clipboard.writeText(o.value.trackingNo); toast('คัดลอกเลขพัสดุแล้ว') } catch { toast(o.value.trackingNo) } }
async function doVoid() {
  try { await orders.void(o.value.id, reason.value); voidOpen.value = false; toast('ยกเลิกแล้ว — คืนเงิน ' + baht(o.value.payment.amount) + ' ให้ลูกค้า', 3500) } catch (e) { toast(e.message) }
}
const print = () => window.print()
</script>

<template>
  <div v-if="o" class="page">
    <AppHeader back :title="o.trackingNo" :sub="`${svc?.name} · รับโดย ${o.receivedBy.name}`" />

    <div class="card">
      <div class="row between"><StatusBadge :status="o.status" />
        <div class="row"><button class="btn soft sm" @click="copy">คัดลอก</button><button class="btn soft sm" @click="labelOpen = true">ใบปะหน้า</button></div></div>
      <h3 class="section-title" style="margin-top:16px">ความคืบหน้า</h3>
      <Timeline :events="o.events" />
      <button v-if="['handed_over', 'in_transit', 'out_for_delivery'].includes(o.status)" class="btn ghost block" @click="orders.advance(o.id)">⏩ จำลองสถานะถัดไป (โหมดทดลอง)</button>
    </div>

    <div class="card">
      <div class="bold">ผู้รับ</div>
      <p>{{ o.receiver.name }}</p>
      <a class="tel" :href="`tel:${o.receiver.phone}`">📞 {{ o.receiver.phone }}</a>
      <p class="muted">{{ o.receiver.address }} {{ o.receiver.province }} {{ o.receiver.postcode }}</p>
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

    <button v-if="o.status === 'received'" class="btn danger block" @click="voidOpen = true">ยกเลิกพัสดุ (Void)</button>

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
</style>
