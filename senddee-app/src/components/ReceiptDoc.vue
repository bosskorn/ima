<script setup>
// Customer copy printed on an 80 mm thermal roll after a visit. It is a drop-off receipt (proof the branch accepted the
// parcels), NOT a tax invoice: SendDee issues the e-Tax invoice / e-Receipt by e-mail from its own system.
import { ref, computed, watch, onMounted } from 'vue'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import BrandLogo from './BrandLogo.vue'
import { useSession } from '../stores/session'
import { baht, maskPhone } from '../utils/format'
import { CARRIERS, COD_RATE, SUPPORT_PHONE } from '../data/constants'

const props = defineProps({ tx: Object, items: Array, credit: Number })
const session = useSession()
const bc = ref(null); const qr = ref('')

const live = computed(() => props.items.filter((o) => o.status !== 'cancelled'))
const shipping = computed(() => live.value.reduce((a, o) => a + o.fee, 0))
const codFees = computed(() => live.value.reduce((a, o) => a + o.codFee, 0))
const total = computed(() => live.value.reduce((a, o) => a + o.charge, 0))
const kg = computed(() => live.value.reduce((a, o) => a + o.parcel.weight, 0))
const carrier = (o) => CARRIERS.find((c) => c.id === o.carrier)?.short
const dt = computed(() => new Date(props.tx.at))
const date = computed(() => dt.value.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }))
const time = computed(() => dt.value.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }))
const pickup = computed(() => (live.value[0]?.pickup === 'home' ? 'รับที่บ้านลูกค้า' : 'หน้าร้าน'))

async function draw() {
  if (bc.value) JsBarcode(bc.value, props.tx.id, { format: 'CODE128', height: 40, displayValue: false, margin: 0, width: 2 })
  qr.value = await QRCode.toString('https://senddee.com', { type: 'svg', margin: 0, errorCorrectionLevel: 'M' })
}
onMounted(draw); watch(() => props.tx.id, draw)
</script>

<template>
  <div class="rc printable" style="page: receipt">
    <div class="hd">
      <BrandLogo variant="print" :size="34" />
      <div class="brand">Send<span>Dee</span></div>
      <div class="br">{{ session.branch }}</div>
      <div class="sm">{{ session.address }}</div>
      <div class="sm">{{ session.province }} {{ session.postcode }} · โทร {{ session.branchPhone }}</div>
    </div>

    <div class="rule" />
    <div class="ttl">ใบรับฝากพัสดุ<small>DROP-OFF RECEIPT</small></div>
    <div class="rule" />

    <div class="kv"><span>เลขที่</span><b>{{ tx.id }}</b></div>
    <div class="kv"><span>วันที่</span><span>{{ date }} {{ time }}</span></div>
    <div class="kv"><span>พนักงาน</span><span>{{ tx.by }}</span></div>
    <div class="kv"><span>สถานที่รับ</span><span>{{ pickup }}</span></div>
    <div class="kv"><span>ผู้ส่ง</span><span>{{ tx.sender.name }}</span></div>
    <div class="kv"><span>เบอร์โทร</span><span>{{ maskPhone(tx.sender.phone) }}</span></div>

    <div class="rule dash" />
    <div class="sec">รายการพัสดุ {{ live.length }} ชิ้น · {{ kg.toFixed(1) }} กก.</div>
    <div v-for="(o, i) in live" :key="o.id" class="it">
      <div class="r1"><span>{{ i + 1 }}. {{ o.trackingNo }}</span><b>{{ baht(o.fee) }}</b></div>
      <div class="r2">{{ carrier(o) }} → {{ o.receiver.province }} · {{ o.parcel.weight }} กก.<template v-if="o.parcel.dims"> · {{ o.parcel.dims.w }}×{{ o.parcel.dims.l }}×{{ o.parcel.dims.h }} ซม.</template></div>
      <div class="r2">ผู้รับ: {{ o.receiver.name }} ({{ maskPhone(o.receiver.phone) }})</div>
      <template v-if="o.cod">
        <div class="r2 cod"><span>COD {{ baht(o.cod) }}</span><span>ค่าธรรมเนียม {{ COD_RATE * 100 }}% {{ baht(o.codFee) }}</span></div>
        <div v-if="o.sender?.bank" class="r2">โอนเข้า {{ o.sender.bank.bank }} ••••{{ o.sender.bank.number.slice(-4) }}</div>
      </template>
    </div>

    <div class="rule dash" />
    <div class="kv"><span>ค่าขนส่ง</span><span>{{ baht(shipping) }}</span></div>
    <div v-if="codFees" class="kv"><span>ค่าเก็บเงินปลายทาง {{ COD_RATE * 100 }}%</span><span>{{ baht(codFees) }}</span></div>
    <div class="tot"><span>ใช้เครดิตรวม</span><span>{{ baht(total) }}</span></div>
    <div v-if="credit != null" class="kv"><span>เครดิตคงเหลือ</span><span>{{ baht(credit) }}</span></div>
    <div class="sm c">ชำระด้วยเครดิตของผู้ส่ง · สาขาไม่รับเงินสด</div>

    <div class="rule dash" />
    <svg ref="bc" class="bc" />
    <div class="c sm">{{ tx.id }}</div>
    <div class="qrw"><div class="qr" v-html="qr" /><div class="qt">ติดตามพัสดุและเอกสารภาษี<br /><b>senddee.com</b></div></div>

    <div class="rule dash" />
    <ul class="note">
      <li>ใบนี้เป็นหลักฐานการรับฝากพัสดุ ไม่ใช่ใบกำกับภาษี</li>
      <li>ใบกำกับภาษีอิเล็กทรอนิกส์ออกโดยระบบ SendDee ส่งทางอีเมล</li>
      <li>เก็บใบนี้ไว้เป็นหลักฐานประกอบการติดตามหรือเคลมพัสดุ</li>
    </ul>
    <div class="c sm">สอบถามสำนักงานใหญ่ {{ SUPPORT_PHONE }}</div>
    <div class="thx">ขอบคุณที่ใช้บริการ SendDee</div>
    <div class="cut">✂ - - - - - - - - - - - - - - - -</div>
  </div>
</template>

<style scoped>
.rc { --f: 11px; background: #fff; color: #000; width: 100%; max-width: 320px; margin: 0 auto; padding: 14px 14px 10px; font-size: var(--f); line-height: 1.35; box-shadow: 0 1px 8px rgba(15,23,42,.15); border-radius: 4px; font-variant-numeric: tabular-nums; }
.hd { text-align: center; } .hd :deep(.bl) { margin-bottom: 4px; }
.brand { font-size: 17px; font-weight: 500; letter-spacing: -.3px; line-height: 1.1; } .brand span { font-weight: 400; }
.br { font-size: 12.5px; font-weight: 500; margin-top: 2px; } .sm { font-size: 10px; color: #222; } .c { text-align: center; }
.rule { border-top: 1.5px solid #000; margin: 5px 0; } .rule.dash { border-top: 1px dashed #000; }
.ttl { text-align: center; font-size: 13px; font-weight: 500; line-height: 1.2; } .ttl small { display: block; font-size: 9px; letter-spacing: 2px; font-weight: 400; }
.kv { display: flex; justify-content: space-between; gap: 8px; } .kv > :last-child { text-align: right; }
.sec { font-weight: 500; margin-bottom: 4px; }
.it { padding: 3px 0; break-inside: avoid; border-bottom: 1px dotted #888; } .it:last-child { border-bottom: 0; }
.r1 { display: flex; justify-content: space-between; font-weight: 500; } .r2 { font-size: 10px; color: #222; padding-left: 14px; } .r2.cod { display: flex; justify-content: space-between; color: #000; }
.tot { display: flex; justify-content: space-between; align-items: baseline; font-size: 14px; font-weight: 500; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 3px 0; margin: 4px 0; }
.bc { width: 100%; height: 30px; margin: 2px 0 1px; }
.qrw { display: flex; align-items: center; gap: 8px; margin-top: 5px; } .qr { width: 56px; height: 56px; flex: none; } .qr :deep(svg) { width: 100%; height: 100%; } .qt { font-size: 10px; line-height: 1.4; }
.note { margin: 0 0 4px; padding-left: 12px; font-size: 9.5px; line-height: 1.4; }
.thx { text-align: center; font-weight: 500; margin-top: 4px; } .cut { text-align: center; color: #666; font-size: 10px; margin-top: 5px; letter-spacing: 1px; }
@media print { .rc { max-width: none; width: 80mm; padding: 3mm 4mm 4mm; box-shadow: none; } }
</style>
