<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { calcFee } from '../api'
import { parseAddress } from '../utils/address'
import { scanBarcode, canCameraScan } from '../utils/scanner'
import { toast } from '../utils/toast'
import { baht } from '../utils/format'
import { PROVINCES } from '../data/provinces'
import { SERVICES, PARCEL_TYPES, PAYMENTS, MAX_WEIGHT_KG } from '../data/constants'

const router = useRouter()
const orders = useOrders()
const session = useSession()

const paste = ref('')
const r = reactive({ name: '', phone: '', address: '', province: '', postcode: '' })
const parsedOnce = ref(false)
const weight = ref('')
const type = ref(PARCEL_TYPES[0])
const note = ref('')
const service = ref(session.defaultService)
const useCod = ref(false)
const cod = ref('')
const payment = ref(session.defaultPayment)
const pickup = ref('shop')
const sender = reactive({ name: '', phone: '', address: '' })
const trackingNo = ref('')
const busy = ref(false)
const tried = ref(false)
const error = ref('')

function doParse() {
  const p = parseAddress(paste.value)
  if (!p.phone && !p.postcode && !p.province && !p.name) return toast('อ่านที่อยู่ไม่ได้ กรุณากรอกเอง')
  Object.assign(r, p); parsedOnce.value = true
  toast('กรอกให้แล้ว ตรวจสอบก่อนยืนยัน')
}
async function pasteClipboard() {
  try { paste.value = await navigator.clipboard.readText(); doParse() } catch { toast('วางข้อความในช่องด้านบนได้เลย') }
}
function onPaste() { setTimeout(doParse, 0) }

async function scan() {
  try {
    const v = await scanBarcode()
    if (v) trackingNo.value = v.toUpperCase()
    else if (!canCameraScan()) toast('สแกนด้วยกล้องใช้ได้ในแอปมือถือ — ใช้เครื่องสแกนหรือพิมพ์เลขแทน')
  } catch (e) { toast(e.message) }
}

const codAmount = computed(() => (useCod.value ? Number(cod.value) || 0 : 0))
const fee = computed(() => calcFee({ weight: weight.value, service: service.value, cod: codAmount.value }))
const quote = (id) => calcFee({ weight: weight.value, service: id }).shipping

const errors = computed(() => {
  const e = {}
  if (r.name.trim().length < 2) e.name = 'กรอกชื่อผู้รับ'
  if (!/^0\d{8,9}$/.test(r.phone)) e.phone = 'เบอร์โทรไม่ถูกต้อง'
  if (r.address.trim().length < 3) e.address = 'กรอกที่อยู่'
  if (!r.province) e.province = 'เลือกจังหวัด'
  if (!/^\d{5}$/.test(r.postcode)) e.postcode = 'รหัสไปรษณีย์ 5 หลัก'
  const w = Number(weight.value)
  if (!(w > 0)) e.weight = 'ชั่งน้ำหนัก'
  else if (w > MAX_WEIGHT_KG) e.weight = `สูงสุด ${MAX_WEIGHT_KG} กก.`
  if (pickup.value === 'home') {
    if (sender.name.trim().length < 2) e.sname = 'กรอกชื่อผู้ฝากส่ง'
    if (!/^0\d{8,9}$/.test(sender.phone)) e.sphone = 'เบอร์ผู้ฝากส่งไม่ถูกต้อง'
    if (sender.address.trim().length < 5) e.saddr = 'กรอกที่อยู่ที่ไปรับพัสดุ'
  }
  if (useCod.value && !(codAmount.value > 0)) e.cod = 'กรอกยอด COD'
  else if (codAmount.value > 50000) e.cod = 'COD สูงสุด 50,000'
  return e
})
const show = (k) => tried.value && errors.value[k]

async function submit() {
  tried.value = true; error.value = ''
  const first = Object.keys(errors.value)[0]
  if (first) {
    document.querySelector(`[data-f="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return toast('ข้อมูลยังไม่ครบ ตรวจช่องสีแดง')
  }
  busy.value = true
  try {
    const o = await orders.create({
      trackingNo: trackingNo.value,
      pickup: pickup.value,
      sender: { name: sender.name.trim() || 'ลูกค้าหน้าร้าน', phone: sender.phone, address: pickup.value === 'home' ? sender.address.trim() : '' },
      receiver: { ...r, name: r.name.trim(), address: r.address.trim() },
      parcel: { weight: Number(weight.value), type: type.value, note: note.value.trim() },
      service: service.value, cod: codAmount.value, payment: payment.value,
    })
    router.replace(`/done/${o.id}`)
  } catch (e) { error.value = e.message; busy.value = false; toast(e.message) }
}
</script>

<template>
  <div class="page">
    <AppHeader back title="รับพัสดุ">
      <button class="scanbtn" @click="scan" aria-label="สแกนเลขพัสดุ">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/></svg>
        <span>สแกน</span>
      </button>
    </AppHeader>

    <div class="blk">
      <h4>สถานที่รับพัสดุ</h4>
      <div class="seg"><button :class="{ on: pickup === 'shop' }" @click="pickup = 'shop'">หน้าร้าน</button><button :class="{ on: pickup === 'home' }" @click="pickup = 'home'">บ้านลูกค้า</button></div>
    </div>

    <!-- tracking number: scan a pre-printed sticker or leave empty to auto-generate -->
    <div class="blk">
      <div class="rw"><label>เลขพัสดุ</label><input v-model="trackingNo" autocapitalize="characters" placeholder="สแกน หรือเว้นว่างให้ระบบสร้าง" /></div>
    </div>

    <div class="blk">
      <h4>ผู้รับ</h4>
      <textarea v-model="paste" class="paste" rows="2" placeholder="วางข้อความที่อยู่ เช่น คุณสมหญิง 081-234-5678 99/1 ม.2 ต.บางพลี จ.สมุทรปราการ 10540" @paste="onPaste" />
      <div class="row pbtn"><button class="lnk" @click="pasteClipboard">วางจากคลิปบอร์ด</button><button class="lnk strong" @click="doParse">แยกที่อยู่อัตโนมัติ</button></div>
      <div class="rw" data-f="name" :class="{ invalid: show('name') }"><label>ชื่อผู้รับ</label><input v-model="r.name" placeholder="ชื่อ-นามสกุล" /></div>
      <div class="rw" data-f="phone" :class="{ invalid: show('phone') }"><label>เบอร์โทร</label><input v-model="r.phone" inputmode="tel" maxlength="10" placeholder="08xxxxxxxx" /></div>
      <div class="rw top" data-f="address" :class="{ invalid: show('address') }"><label>ที่อยู่</label><textarea v-model="r.address" rows="2" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ" /></div>
      <div class="rw" data-f="province" :class="{ invalid: show('province') }"><label>จังหวัด</label>
        <select v-model="r.province"><option value="" disabled>เลือกจังหวัด</option><option v-for="p in PROVINCES" :key="p">{{ p }}</option></select></div>
      <div class="rw" data-f="postcode" :class="{ invalid: show('postcode') }"><label>รหัสไปรษณีย์</label><input v-model="r.postcode" inputmode="numeric" maxlength="5" placeholder="5 หลัก" /></div>
    </div>

    <div class="blk">
      <h4>พัสดุ</h4>
      <div class="rw" data-f="weight" :class="{ invalid: show('weight') }"><label>น้ำหนัก (กก.)</label><input v-model="weight" class="big" inputmode="decimal" placeholder="0.0" /></div>
      <div class="chips"><button v-for="n in [0.5, 1, 2, 3, 5, 10]" :key="n" class="chip" :class="{ on: Number(weight) === n }" @click="weight = String(n)">{{ n }}</button></div>
      <div class="rw"><label>ประเภทสินค้า</label><select v-model="type"><option v-for="t in PARCEL_TYPES" :key="t">{{ t }}</option></select></div>
      <div class="rw"><label>หมายเหตุ</label><input v-model="note" placeholder="เช่น ระวังแตก" /></div>
      <div class="rw"><label>เก็บเงินปลายทาง (COD)</label><label class="tg"><input v-model="useCod" type="checkbox" /><i /></label></div>
      <div v-if="useCod" class="rw" data-f="cod" :class="{ invalid: show('cod') }"><label>ยอด COD (บาท)</label><input v-model="cod" inputmode="numeric" placeholder="0" /></div>
      <p v-if="codAmount" class="hint">ค่าธรรมเนียม COD {{ baht(fee.codFee) }} หักจากเงินปลายทาง ไม่เก็บที่เคาน์เตอร์</p>
    </div>

    <div class="blk">
      <h4>บริการ</h4>
      <button v-for="s in SERVICES" :key="s.id" class="sv" :class="{ on: service === s.id }" @click="service = s.id">
        <i class="rd" /><span class="nm">{{ s.name }}<small>ส่งถึง {{ s.eta }}</small></span><span class="pr">{{ Number(weight) > 0 ? baht(quote(s.id)) : '–' }}</span>
      </button>
    </div>

    <div class="blk">
      <h4>รับเงินจากลูกค้า</h4>
      <div class="chips" style="margin-top:0"><button v-for="p in PAYMENTS" :key="p.id" class="chip" :class="{ on: payment === p.id }" @click="payment = p.id">{{ p.label }}</button></div>
      <div class="rw" data-f="sname" :class="{ invalid: show('sname') }"><label>ผู้ฝากส่ง</label><input v-model="sender.name" :placeholder="pickup === 'home' ? 'ชื่อลูกค้า' : 'ลูกค้าหน้าร้าน'" /></div>
      <div class="rw" data-f="sphone" :class="{ invalid: show('sphone') }"><label>เบอร์ผู้ฝากส่ง</label><input v-model="sender.phone" inputmode="tel" maxlength="10" :placeholder="pickup === 'home' ? '08xxxxxxxx' : 'ไม่บังคับ'" /></div>
      <div v-if="pickup === 'home'" class="rw top" data-f="saddr" :class="{ invalid: show('saddr') }"><label>ที่อยู่รับพัสดุ</label><textarea v-model="sender.address" rows="2" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด" /></div>
      <p v-if="error" class="hint" style="color:var(--danger)">{{ error }}</p>
    </div>

    <div class="stickybar">
      <div class="total"><small class="muted">รับเงินลูกค้า</small><b>{{ baht(fee.shipping) }}</b></div>
      <button class="btn accent" :disabled="busy" @click="submit">{{ busy ? 'กำลังบันทึก…' : 'รับพัสดุ & ออกใบปะหน้า' }}</button>
    </div>
  </div>
</template>

<style scoped>
.seg { display: flex; background: #eef0f2; border-radius: 10px; padding: 3px; margin: 6px 0 8px; } .seg button { flex: 1; border: 0; background: transparent; padding: 10px 0; border-radius: 8px; font-size: 15px; color: var(--muted); } .seg button.on { background: #fff; color: var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.scanbtn { border: 0; background: rgba(255,255,255,.16); color: #fff; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 6px; font-size: 14px; }
.blk { background: #fff; margin: 10px -16px 0; padding: 4px 16px 8px; }
.blk h4 { margin: 0; padding: 12px 0 4px; font-size: 13px; color: var(--muted); font-weight: 400; }
.rw { display: flex; align-items: center; gap: 12px; min-height: 52px; border-bottom: 1px solid var(--line); }
.rw:last-child { border-bottom: 0; }
.rw.top { align-items: flex-start; padding-top: 14px; }
.rw > label:first-child { flex: 0 0 38%; color: var(--text); font-size: 15px; }
.rw input, .rw select, .rw textarea { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; text-align: right; font-size: 15px; padding: 8px 0; color: var(--text); }
.rw select { direction: rtl; appearance: none; -webkit-appearance: none; }
.rw textarea { resize: none; }
.rw input::placeholder, .rw textarea::placeholder { color: #b5bac1; }
.rw.invalid { border-bottom-color: var(--danger); } .rw.invalid > label:first-child { color: var(--danger); }
.rw .big { font-size: 26px; color: var(--primary); }
.paste { width: 100%; margin: 6px 0 0; padding: 10px 12px; border: 1px dashed #b8c2c0; border-radius: 8px; background: #f7faf9; outline: none; resize: none; font-size: 14px; }
.pbtn { justify-content: flex-end; gap: 18px; padding: 8px 0 6px; }
.lnk { border: 0; background: transparent; color: var(--muted); font-size: 14px; padding: 4px 0; } .lnk.strong { color: var(--primary); }
.chips { display: flex; gap: 8px; flex-wrap: wrap; padding: 8px 0 12px; }
.chip { padding: 6px 16px; }
.hint { color: var(--muted); font-size: 13px; padding: 4px 0 8px; }
.tg { margin-left: auto; position: relative; flex: none !important; width: 46px; height: 26px; } .tg input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; z-index: 1; }
.tg i { position: absolute; inset: 0; background: #cfd4da; border-radius: 13px; transition: .15s; } .tg i::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: .15s; }
.tg input:checked + i { background: var(--primary); } .tg input:checked + i::after { left: 23px; }
.sv { width: 100%; display: flex; align-items: center; gap: 12px; border: 0; border-bottom: 1px solid var(--line); background: transparent; padding: 12px 0; font: inherit; color: inherit; text-align: left; }
.sv:last-child { border-bottom: 0; }
.rd { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #c5cad1; flex: none; position: relative; }
.sv.on .rd { border-color: var(--primary); } .sv.on .rd::after { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: var(--primary); }
.nm { flex: 1; font-size: 15px; } .nm small { display: block; color: var(--muted); font-size: 12px; }
.pr { font-size: 18px; color: var(--primary); }
</style>
