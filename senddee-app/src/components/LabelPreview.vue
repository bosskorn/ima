<script setup>
import { onMounted, watch, ref, computed } from 'vue'
import JsBarcode from 'jsbarcode'
import { SERVICES } from '../data/constants'
import { useSession } from '../stores/session'

const props = defineProps({ order: Object })
const session = useSession()
const bc = ref(null)
const svc = computed(() => SERVICES.find((s) => s.id === props.order.service))
const draw = () => bc.value && JsBarcode(bc.value, props.order.trackingNo, { format: 'CODE128', height: 56, displayValue: false, margin: 0, width: 2 })
onMounted(draw); watch(() => props.order.trackingNo, draw)
const d = computed(() => new Date(props.order.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }))
</script>

<template>
  <div class="label printable" :style="{ '--paper': session.paper === '80' ? '80mm' : '100mm', maxWidth: session.paper === '80' ? '280px' : '330px' }">
    <div class="top"><b class="logo">SENDDEE</b><span class="svc">{{ svc?.name?.toUpperCase() }}</span></div>
    <svg ref="bc" class="bc" />
    <div class="no">{{ order.trackingNo }}</div>
    <div class="to">
      <small>ผู้รับ / TO</small>
      <div class="nm">{{ order.receiver.name }} · {{ order.receiver.phone }}</div>
      <div class="ad">{{ order.receiver.address }}</div>
      <div class="pv">{{ order.receiver.province }} {{ order.receiver.postcode }}</div>
    </div>
    <div class="meta">
      <div><small>ผู้ส่ง</small> {{ order.sender?.name || 'ลูกค้าหน้าร้าน' }}<template v-if="order.sender?.phone"> · {{ order.sender.phone }}</template> · {{ session.branch }}</div>
      <div v-if="order.sender?.address" class="muted">{{ order.sender.address }}</div>
      <div><small>น้ำหนัก</small> {{ order.parcel.weight }} กก. · {{ order.parcel.type }}</div>
      <div class="muted">{{ d }}</div>
    </div>
    <div v-if="order.cod" class="cod">COD ฿{{ order.cod.toLocaleString('th-TH') }}</div>
  </div>
</template>

<style scoped>
.label { background: #fff; color: #000; border: 2px solid #000; border-radius: 6px; padding: 10px; width: 100%; max-width: 330px; margin: 0 auto; font-size: 13px; }
.top { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 6px; }
.logo { font-size: 20px; letter-spacing: 1px; } .svc { border: 2px solid #000; padding: 1px 8px; font-weight: 500; font-size: 12px; }
.bc { width: 100%; height: 56px; margin-top: 8px; }
.no { text-align: center; font-weight: 500; letter-spacing: 2px; margin: 2px 0 8px; font-size: 14px; }
.to { border-top: 1px dashed #000; padding-top: 6px; } small { font-size: 10px; color: #444; margin-right: 4px; }
.nm { font-weight: 500; font-size: 15px; } .ad { margin: 2px 0; } .pv { font-weight: 500; font-size: 17px; }
.meta { border-top: 1px dashed #000; margin-top: 8px; padding-top: 6px; font-size: 12px; } .muted { color: #555; }
.cod { margin-top: 8px; border: 3px solid #000; text-align: center; font-size: 22px; font-weight: 500; padding: 4px; }
</style>
