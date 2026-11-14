<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import Timeline from '../components/Timeline.vue'
import { useOrders } from '../stores/orders'
import { SERVICES } from '../data/constants'

const props = defineProps({ id: String })
const orders = useOrders()
const router = useRouter()
const toast = ref('')
onMounted(() => orders.load())

const order = computed(() => orders.list.find((o) => o.id === props.id))
const service = computed(() => SERVICES.find((s) => s.id === order.value?.service))

function say(t) { toast.value = t; setTimeout(() => (toast.value = ''), 2200) }
async function copy() {
  try { await navigator.clipboard.writeText(order.value.trackingNo); say('คัดลอกเลขพัสดุแล้ว') } catch { say(order.value.trackingNo) }
}
async function share() {
  const text = `พัสดุ Senddee เลขที่ ${order.value.trackingNo}`
  if (navigator.share) { try { await navigator.share({ title: 'Senddee', text }) } catch {} } else copy()
}
async function cancel() {
  if (!confirm('ยืนยันยกเลิกออเดอร์นี้?')) return
  try { await orders.cancel(order.value.id); say('ยกเลิกออเดอร์แล้ว') } catch (e) { say(e.message) }
}
</script>

<template>
  <div class="page" v-if="order">
    <AppHeader back :title="order.trackingNo" :sub="service?.name" />

    <div class="card">
      <div class="row between"><StatusBadge :status="order.status" />
        <div class="row"><button class="btn soft sm" @click="copy">คัดลอก</button><button class="btn soft sm" @click="share">แชร์</button></div>
      </div>
      <h3 class="section-title" style="margin-top:16px">ความคืบหน้า</h3>
      <Timeline :events="order.events" />
      <button v-if="!['delivered','cancelled'].includes(order.status)" class="btn ghost block" @click="orders.advance(order.id)">
        ⏩ จำลองสถานะถัดไป (โหมดทดลอง)
      </button>
    </div>

    <div class="card">
      <h3 class="bold">ผู้ส่ง</h3>
      <p>{{ order.sender.name }} · {{ order.sender.phone }}</p>
      <p class="muted">{{ order.sender.address }} {{ order.sender.province }} {{ order.sender.postcode }}</p>
      <hr />
      <h3 class="bold">ผู้รับ</h3>
      <p>{{ order.receiver.name }} · {{ order.receiver.phone }}</p>
      <p class="muted">{{ order.receiver.address }} {{ order.receiver.province }} {{ order.receiver.postcode }}</p>
    </div>

    <div class="card">
      <h3 class="bold">พัสดุและค่าบริการ</h3>
      <div class="kv"><span class="muted">ประเภท</span><span>{{ order.parcel.type }}</span></div>
      <div class="kv"><span class="muted">น้ำหนัก</span><span>{{ order.parcel.weight }} กก.</span></div>
      <div v-if="order.parcel.note" class="kv"><span class="muted">หมายเหตุ</span><span>{{ order.parcel.note }}</span></div>
      <div class="kv"><span class="muted">ค่าขนส่ง ({{ service?.name }})</span><span>฿{{ order.fee }}</span></div>
      <div v-if="order.cod" class="kv"><span class="muted">COD</span><span>฿{{ order.cod.toLocaleString() }}</span></div>
      <div v-if="order.codFee" class="kv"><span class="muted">ค่าธรรมเนียม COD</span><span>฿{{ order.codFee }}</span></div>
      <div class="kv total"><span>รวมค่าบริการ</span><span>฿{{ order.fee + order.codFee }}</span></div>
    </div>

    <button v-if="order.status === 'pending'" class="btn danger block" @click="cancel">ยกเลิกออเดอร์</button>
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
  <div v-else class="page"><AppHeader back title="ไม่พบออเดอร์" /><button class="btn block" @click="router.push('/orders')">กลับไปรายการ</button></div>
</template>

<style scoped>
hr { border: 0; border-top: 1px solid var(--line); margin: 12px 0; }
.kv { display: flex; justify-content: space-between; padding: 6px 0; gap: 12px; }
.kv span:last-child { text-align: right; }
.total { border-top: 1px dashed var(--line); margin-top: 6px; padding-top: 10px; font-weight: 700; color: var(--primary); }
.sm { padding: 6px 12px; font-size: 13px; }
</style>
