<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrders } from '../stores/orders'
import { calcFee } from '../api'
import { parseAddress } from '../utils/address'
import { scanBarcode, canCameraScan } from '../utils/scanner'
import { toast } from '../utils/toast'
import { baht } from '../utils/format'
import { PROVINCES } from '../data/provinces'
import { SERVICES, PARCEL_TYPES, PAYMENTS, MAX_WEIGHT_KG } from '../data/constants'

const router = useRouter()
const orders = useOrders()

const paste = ref('')
const r = reactive({ name: '', phone: '', address: '', province: '', postcode: '' })
const parsedOnce = ref(false)
const weight = ref('')
const type = ref(PARCEL_TYPES[0])
const note = ref('')
const service = ref('standard')
const useCod = ref(false)
const cod = ref('')
const payment = ref('cash')
const sender = reactive({ name: '', phone: '' })
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
      sender: { name: sender.name.trim() || 'ลูกค้าหน้าร้าน', phone: sender.phone },
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
    <header class="hdr"><h1>รับพัสดุ</h1><p>กรอกครั้งเดียว ใบปะหน้าออกทันที</p></header>

    <!-- 1. address smart-paste -->
    <div class="card">
      <div class="bold">1 · ผู้รับ</div>
      <textarea v-model="paste" class="paste" rows="3" placeholder="วางข้อความที่ลูกค้าส่งมา เช่น &quot;คุณสมหญิง 081-234-5678 99/1 ม.2 ต.บางพลี จ.สมุทรปราการ 10540&quot;" @paste="onPaste" />
      <div class="row" style="margin:8px 0 12px">
        <button class="btn soft sm" @click="pasteClipboard">📋 วางจากคลิปบอร์ด</button>
        <button class="btn sm" @click="doParse">✨ แยกที่อยู่ให้อัตโนมัติ</button>
      </div>
      <label class="field" data-f="name" :class="{ invalid: show('name') }"><span>ชื่อผู้รับ</span><input v-model="r.name" /><div v-if="show('name')" class="err">{{ errors.name }}</div></label>
      <label class="field" data-f="phone" :class="{ invalid: show('phone') }"><span>เบอร์โทร</span><input v-model="r.phone" inputmode="tel" maxlength="10" /><div v-if="show('phone')" class="err">{{ errors.phone }}</div></label>
      <label class="field" data-f="address" :class="{ invalid: show('address') }"><span>ที่อยู่</span><textarea v-model="r.address" rows="2" /><div v-if="show('address')" class="err">{{ errors.address }}</div></label>
      <div class="grid2">
        <label class="field" data-f="province" :class="{ invalid: show('province') }"><span>จังหวัด</span>
          <select v-model="r.province"><option value="" disabled>เลือก…</option><option v-for="p in PROVINCES" :key="p">{{ p }}</option></select><div v-if="show('province')" class="err">{{ errors.province }}</div></label>
        <label class="field" data-f="postcode" :class="{ invalid: show('postcode') }"><span>รหัสไปรษณีย์</span><input v-model="r.postcode" inputmode="numeric" maxlength="5" /><div v-if="show('postcode')" class="err">{{ errors.postcode }}</div></label>
      </div>
    </div>

    <!-- 2. parcel -->
    <div class="card">
      <div class="bold" style="margin-bottom:10px">2 · พัสดุ</div>
      <label class="field" data-f="weight" :class="{ invalid: show('weight') }"><span>น้ำหนัก (กก.)</span>
        <input v-model="weight" class="big" inputmode="decimal" placeholder="0.0" /><div v-if="show('weight')" class="err">{{ errors.weight }}</div></label>
      <div class="chip-row" style="margin-bottom:12px"><button v-for="n in [0.5, 1, 2, 3, 5, 10]" :key="n" class="chip" :class="{ on: Number(weight) === n }" @click="weight = String(n)">{{ n }}</button></div>
      <label class="field"><span>ประเภทสินค้า</span><select v-model="type"><option v-for="t in PARCEL_TYPES" :key="t">{{ t }}</option></select></label>
      <label class="field"><span>หมายเหตุ (ไม่บังคับ)</span><input v-model="note" placeholder="เช่น ระวังแตก" /></label>
      <label class="switch"><input v-model="useCod" type="checkbox" /><span>เก็บเงินปลายทาง (COD)</span></label>
      <label v-if="useCod" class="field" data-f="cod" :class="{ invalid: show('cod') }" style="margin-top:10px"><span>ยอดเก็บปลายทาง (บาท)</span><input v-model="cod" inputmode="numeric" /><div v-if="show('cod')" class="err">{{ errors.cod }}</div></label>
    </div>

    <!-- 3. service -->
    <div class="card">
      <div class="bold" style="margin-bottom:10px">3 · บริการ</div>
      <div class="svcs">
        <button v-for="s in SERVICES" :key="s.id" class="svc" :class="{ on: service === s.id }" @click="service = s.id">
          <b>{{ s.name }}</b><small>{{ s.eta }}</small><span class="p">{{ Number(weight) > 0 ? baht(quote(s.id)) : '—' }}</span>
        </button>
      </div>
    </div>

    <!-- 4. payment + optional -->
    <div class="card">
      <div class="bold" style="margin-bottom:10px">4 · รับเงินจากลูกค้า</div>
      <div class="chip-row"><button v-for="p in PAYMENTS" :key="p.id" class="chip" :class="{ on: payment === p.id }" @click="payment = p.id">{{ p.label }}</button></div>
      <details class="more">
        <summary>ตัวเลือกเพิ่มเติม (ผู้ฝากส่ง / ใช้สติกเกอร์เลขพัสดุ)</summary>
        <label class="field"><span>ชื่อผู้ฝากส่ง</span><input v-model="sender.name" placeholder="ลูกค้าหน้าร้าน" /></label>
        <label class="field"><span>เบอร์ผู้ฝากส่ง</span><input v-model="sender.phone" inputmode="tel" maxlength="10" /></label>
        <label class="field"><span>เลขพัสดุจากสติกเกอร์ (เว้นว่าง = สร้างอัตโนมัติ)</span>
          <div class="row"><input v-model="trackingNo" autocapitalize="characters" placeholder="สแกน/พิมพ์เลข" style="flex:1" /><button class="icon-btn" type="button" @click="scan" aria-label="สแกน">📷</button></div></label>
      </details>
      <p v-if="codAmount" class="muted" style="margin-top:10px">ค่าธรรมเนียม COD {{ baht(fee.codFee) }} จะถูกหักจากเงินปลายทาง (ไม่เก็บที่เคาน์เตอร์)</p>
      <p v-if="error" class="err" style="color:var(--danger);margin-top:8px">{{ error }}</p>
    </div>

    <div class="stickybar">
      <div class="total"><small class="muted">รับเงินลูกค้า</small><b>{{ baht(fee.shipping) }}</b></div>
      <button class="btn accent" :disabled="busy" @click="submit">{{ busy ? 'กำลังบันทึก…' : 'รับพัสดุ & ออกใบปะหน้า' }}</button>
    </div>
  </div>
</template>

<style scoped>
.hdr { background: var(--primary); color: #fff; padding: calc(14px + var(--safe-top)) 16px 18px; margin: 0 -16px 14px; border-radius: 0 0 22px 22px; }
h1 { font-size: 19px; } .hdr p { font-size: 13px; opacity: .85; margin-top: 2px; }
.paste { width: 100%; margin-top: 8px; padding: 12px; border: 2px dashed var(--primary); border-radius: 8px; background: #f0fdfa; outline: none; resize: none; }
.big { font-size: 26px !important; font-weight: 500; text-align: center; }
.switch { display: flex; align-items: center; gap: 10px; font-weight: 500; } .switch input { width: 22px; height: 22px; accent-color: var(--primary); }
.svcs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.svc { border: 2px solid var(--line); background: #fff; border-radius: 8px; padding: 12px 4px; display: flex; flex-direction: column; align-items: center; gap: 2px; font: inherit; color: inherit; }
.svc small { color: var(--muted); font-size: 11px; } .svc .p { font-size: 17px; font-weight: 500; color: var(--primary); margin-top: 4px; }
.svc.on { border-color: var(--primary); background: #f0fdfa; }
.more { margin-top: 14px; } .more summary { color: var(--primary); font-weight: 500; font-size: 14px; margin-bottom: 10px; }
</style>
