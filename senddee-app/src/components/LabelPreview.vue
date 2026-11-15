<script setup>
// 100 x 150 mm thermal shipping label (the franchise kit uses 100x150 sticker rolls). Everything is sized in container
// width units (1cqw = 1mm at 100 mm), so the on-screen preview and the printed label share one layout.
import { onMounted, watch, ref, computed } from 'vue'
import JsBarcode from 'jsbarcode'
import { CARRIERS } from '../data/constants'
import { useSession } from '../stores/session'
import BrandLogo from './BrandLogo.vue'

const props = defineProps({ order: Object })
const session = useSession()
const bc = ref(null)
const carrier = computed(() => CARRIERS.find((c) => c.id === props.order.carrier))
const draw = () => bc.value && JsBarcode(bc.value, props.order.trackingNo, { format: 'CODE128', height: 60, displayValue: false, margin: 0, width: 2 })
onMounted(draw); watch(() => props.order.trackingNo, draw)
const d = computed(() => new Date(props.order.createdAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }))
const wide = computed(() => session.paper !== '80')
</script>

<template>
  <div class="label printable" :style="{ page: wide ? 'label' : 'label80', '--paper': wide ? '100mm' : '80mm' }">
    <div class="lb">
      <div class="top">
        <BrandLogo variant="print" :size="30" text />
        <img v-if="carrier" class="cr" :src="carrier.logo" :alt="carrier.name" />
      </div>

      <svg ref="bc" class="bc" />
      <div class="no">{{ order.trackingNo }}</div>

      <div class="dest">
        <small>ปลายทาง / TO</small>
        <div class="pv">{{ order.receiver.province }} <span>{{ order.receiver.postcode }}</span></div>
        <div class="nm">{{ order.receiver.name }} · {{ order.receiver.phone }}</div>
        <div class="ad">{{ order.receiver.address }}</div>
      </div>

      <div v-if="order.cod" class="cod"><span>COD</span><b>฿{{ order.cod.toLocaleString('th-TH') }}</b></div>

      <div class="frm">
        <small>ผู้ส่ง / FROM</small>
        <div>{{ order.sender?.name || 'ลูกค้าหน้าร้าน' }}<template v-if="order.sender?.phone"> · {{ order.sender.phone }}</template></div>
        <div v-if="order.sender?.address" class="ad2">{{ order.sender.address }}</div>
        <div class="ad2">{{ session.branch }} · {{ session.branchPhone }}</div>
      </div>

      <div class="grid3">
        <div><small>น้ำหนัก</small><b>{{ order.parcel.weight }} กก.</b></div>
        <div><small>ขนาด (ซม.)</small><b v-if="order.parcel.dims">{{ order.parcel.dims.w }}×{{ order.parcel.dims.l }}×{{ order.parcel.dims.h }}</b><b v-else>-</b></div>
        <div><small>ประเภทสินค้า</small><b class="ty">{{ order.parcel.type }}</b></div>
      </div>
      <div v-if="order.parcel.note" class="note">หมายเหตุ: {{ order.parcel.note }}</div>
      <div class="meta">{{ d }} · {{ order.receivedBy?.id }}</div>
    </div>
  </div>
</template>

<style scoped>
.label { background: #fff; color: #000; width: 100%; max-width: 340px; margin: 0 auto; border: 1px solid #000; border-radius: 4px; aspect-ratio: 100 / 150; box-sizing: border-box; container-type: inline-size; overflow: hidden; }
.lb { width: 100%; height: 100%; padding: 4cqw; display: flex; flex-direction: column; box-sizing: border-box; font-size: 3.6cqw; line-height: 1.3; }
.top { display: flex; justify-content: space-between; align-items: center; border-bottom: .6cqw solid #000; padding-bottom: 2cqw; }
.top :deep(.bl svg) { width: 8cqw; height: 8cqw; } .top :deep(.t) { font-size: 5.2cqw !important; }
.cr { height: 7cqw; max-width: 24cqw; object-fit: contain; filter: grayscale(1) contrast(2); }
.bc { width: 100%; height: 16cqw; margin-top: 2.5cqw; } .no { text-align: center; font-weight: 500; font-size: 4.4cqw; letter-spacing: .5cqw; margin: .5cqw 0 2cqw; }
small { display: block; font-size: 2.8cqw; color: #333; letter-spacing: .2cqw; }
.dest { border-top: .4cqw dashed #000; padding-top: 1.5cqw; }
.pv { font-size: 11cqw; font-weight: 500; line-height: 1.1; } .pv span { font-size: 6cqw; font-weight: 400; margin-left: 1cqw; }
.nm { font-size: 5.4cqw; font-weight: 500; margin-top: 1.5cqw; } .ad { font-size: 4.4cqw; margin-top: .8cqw; line-height: 1.35; }
.cod { display: flex; justify-content: space-between; align-items: center; background: #000; color: #fff; padding: 1.2cqw 3cqw; margin: 2cqw 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.cod span { font-size: 4cqw; } .cod b { font-size: 8cqw; font-weight: 500; }
.frm { border-top: .4cqw dashed #000; margin-top: 2cqw; padding-top: 1.5cqw; } .ad2 { font-size: 3.2cqw; color: #222; }
.grid3 { display: grid; grid-template-columns: 1fr 1.4fr 1.6fr; border: .5cqw solid #000; margin-top: 2cqw; } .grid3 > div { padding: 1.2cqw 1.8cqw; border-right: .4cqw solid #000; min-width: 0; } .grid3 > div:last-child { border-right: 0; } .grid3 b { font-size: 4.2cqw; font-weight: 500; display: block; } .grid3 .ty { font-size: 3.4cqw; line-height: 1.2; }
.note { font-size: 3.2cqw; margin-top: 1cqw; } .meta { font-size: 2.8cqw; color: #444; margin-top: auto; padding-top: 1cqw; }
@media print { .label { width: var(--paper) !important; max-width: none !important; border: 0; border-radius: 0; height: auto; } }
</style>
