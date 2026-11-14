<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useOrders } from '../stores/orders'
import { useProfile } from '../stores/profile'
import { calcFee } from '../api'
import { PROVINCES } from '../data/provinces'
import { SERVICES, PARCEL_TYPES, MAX_WEIGHT_KG } from '../data/constants'

const router = useRouter()
const orders = useOrders()
const profile = useProfile()

const steps = ['ผู้รับ', 'พัสดุ', 'บริการ', 'ยืนยัน']
const step = ref(0)
const busy = ref(false)
const error = ref('')
const touched = ref(false)

const receiver = reactive({ name: '', phone: '', address: '', province: '', postcode: '' })
const parcel = reactive({ weight: '', type: PARCEL_TYPES[5], note: '' })
const service = ref('standard')
const useCod = ref(false)
const cod = ref('')
const sender = computed(() => ({
  name: profile.name, phone: profile.phone, address: profile.address, province: profile.province, postcode: profile.postcode,
}))

const errors = computed(() => {
  const e = {}
  if (step.value === 0) {
    if (receiver.name.trim().length < 2) e.name = 'กรุณากรอกชื่อผู้รับ'
    if (!/^0\d{8,9}$/.test(receiver.phone)) e.phone = 'เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)'
    if (receiver.address.trim().length < 5) e.address = 'กรุณากรอกที่อยู่ให้ครบ'
    if (!receiver.province) e.province = 'เลือกจังหวัด'
    if (!/^\d{5}$/.test(receiver.postcode)) e.postcode = 'รหัสไปรษณีย์ 5 หลัก'
  }
  if (step.value === 1) {
    const w = Number(parcel.weight)
    if (!(w > 0)) e.weight = 'กรอกน้ำหนักพัสดุ'
    else if (w > MAX_WEIGHT_KG) e.weight = `น้ำหนักสูงสุด ${MAX_WEIGHT_KG} กก.`
    if (useCod.value && !(Number(cod.value) > 0)) e.cod = 'กรอกยอดเก็บเงินปลายทาง'
    else if (useCod.value && Number(cod.value) > 50000) e.cod = 'COD สูงสุด 50,000 บาท'
  }
  return e
})

const codAmount = computed(() => (useCod.value ? Number(cod.value) || 0 : 0))
const fee = computed(() => calcFee({ weight: parcel.weight, service: service.value, cod: codAmount.value }))
const quote = (id) => calcFee({ weight: parcel.weight, service: id }).shipping
const svc = computed(() => SERVICES.find((s) => s.id === service.value))

function next() {
  touched.value = true
  if (Object.keys(errors.value).length) return
  touched.value = false
  step.value++
  window.scrollTo({ top: 0 })
}
function prev() { step.value > 0 ? step.value-- : router.back() }

async function submit() {
  busy.value = true; error.value = ''
  try {
    const o = await orders.create({
      sender: sender.value,
      receiver: { ...receiver, name: receiver.name.trim() },
      parcel: { weight: Number(parcel.weight), type: parcel.type, note: parcel.note.trim() },
      service: service.value,
      cod: codAmount.value,
    })
    router.replace(`/orders/${o.id}`)
  } catch (e) {
    error.value = e.message || 'สร้างออเดอร์ไม่สำเร็จ'
    busy.value = false
  }
}
const show = (k) => touched.value && errors.value[k]
</script>

<template>
  <div class="page">
    <AppHeader back title="สร้างออเดอร์ใหม่" :sub="`ขั้นตอน ${step + 1}/${steps.length} · ${steps[step]}`" />

    <div class="bar"><i v-for="(s, i) in steps" :key="s" :class="{ on: i <= step }" /></div>

    <!-- Step 1: receiver -->
    <div v-if="step === 0" class="card">
      <label class="field" :class="{ invalid: show('name') }"><span>ชื่อผู้รับ</span><input v-model="receiver.name" autocomplete="off" /><div v-if="show('name')" class="err">{{ errors.name }}</div></label>
      <label class="field" :class="{ invalid: show('phone') }"><span>เบอร์โทรผู้รับ</span><input v-model="receiver.phone" inputmode="tel" maxlength="10" /><div v-if="show('phone')" class="err">{{ errors.phone }}</div></label>
      <label class="field" :class="{ invalid: show('address') }"><span>ที่อยู่ (บ้านเลขที่ ถนน ตำบล อำเภอ)</span><textarea v-model="receiver.address" rows="2" /><div v-if="show('address')" class="err">{{ errors.address }}</div></label>
      <div class="grid2">
        <label class="field" :class="{ invalid: show('province') }"><span>จังหวัด</span>
          <select v-model="receiver.province"><option value="" disabled>เลือก…</option><option v-for="p in PROVINCES" :key="p">{{ p }}</option></select>
          <div v-if="show('province')" class="err">{{ errors.province }}</div></label>
        <label class="field" :class="{ invalid: show('postcode') }"><span>รหัสไปรษณีย์</span><input v-model="receiver.postcode" inputmode="numeric" maxlength="5" /><div v-if="show('postcode')" class="err">{{ errors.postcode }}</div></label>
      </div>
      <p class="muted">ผู้ส่ง: {{ profile.name }} ({{ profile.province }})</p>
    </div>

    <!-- Step 2: parcel -->
    <div v-if="step === 1" class="card">
      <div class="grid2">
        <label class="field" :class="{ invalid: show('weight') }"><span>น้ำหนัก (กก.)</span><input v-model="parcel.weight" inputmode="decimal" placeholder="0.0" /><div v-if="show('weight')" class="err">{{ errors.weight }}</div></label>
        <label class="field"><span>ประเภทสินค้า</span><select v-model="parcel.type"><option v-for="t in PARCEL_TYPES" :key="t">{{ t }}</option></select></label>
      </div>
      <label class="field"><span>หมายเหตุ (ไม่บังคับ)</span><input v-model="parcel.note" placeholder="เช่น ระวังแตก" /></label>
      <label class="switch"><input type="checkbox" v-model="useCod" /><span>เก็บเงินปลายทาง (COD)</span></label>
      <label v-if="useCod" class="field" :class="{ invalid: show('cod') }" style="margin-top:12px"><span>ยอดเก็บเงิน (บาท)</span><input v-model="cod" inputmode="numeric" /><div v-if="show('cod')" class="err">{{ errors.cod }}</div></label>
    </div>

    <!-- Step 3: service -->
    <div v-if="step === 2" class="stack">
      <button v-for="s in SERVICES" :key="s.id" class="card svc" :class="{ on: service === s.id }" @click="service = s.id">
        <div class="grow"><div class="bold">{{ s.name }}</div><div class="muted">{{ s.desc }}</div></div>
        <div class="price">฿{{ quote(s.id) }}</div>
      </button>
    </div>

    <!-- Step 4: confirm -->
    <div v-if="step === 3" class="stack">
      <div class="card">
        <h3 class="bold">ผู้รับ</h3>
        <p>{{ receiver.name }} · {{ receiver.phone }}</p>
        <p class="muted">{{ receiver.address }} {{ receiver.province }} {{ receiver.postcode }}</p>
      </div>
      <div class="card">
        <div class="kv"><span class="muted">พัสดุ</span><span>{{ parcel.type }} · {{ parcel.weight }} กก.</span></div>
        <div class="kv"><span class="muted">บริการ</span><span>{{ svc.name }} ({{ svc.eta }})</span></div>
        <div class="kv"><span class="muted">ค่าขนส่ง</span><span>฿{{ fee.shipping }}</span></div>
        <div v-if="codAmount" class="kv"><span class="muted">COD ฿{{ codAmount.toLocaleString() }} (ค่าธรรมเนียม)</span><span>฿{{ fee.codFee }}</span></div>
        <div class="kv total"><span>รวมค่าบริการ</span><span>฿{{ fee.total }}</span></div>
      </div>
      <p v-if="error" class="err" style="color:var(--danger)">{{ error }}</p>
    </div>

    <div class="footer">
      <button class="btn ghost" @click="prev">{{ step === 0 ? 'ยกเลิก' : 'ย้อนกลับ' }}</button>
      <button v-if="step < 3" class="btn grow" @click="next">ถัดไป</button>
      <button v-else class="btn accent grow" :disabled="busy" @click="submit">{{ busy ? 'กำลังสร้าง…' : `ยืนยันสร้างออเดอร์ · ฿${fee.total}` }}</button>
    </div>
  </div>
</template>

<style scoped>
.bar { display: flex; gap: 6px; margin-bottom: 14px; }
.bar i { flex: 1; height: 5px; border-radius: 4px; background: var(--line); }
.bar i.on { background: var(--primary); }
.switch { display: flex; align-items: center; gap: 10px; font-weight: 500; }
.switch input { width: 20px; height: 20px; accent-color: var(--primary); }
.svc { width: 100%; display: flex; align-items: center; gap: 12px; text-align: left; border: 2px solid transparent; font: inherit; color: inherit; }
.svc.on { border-color: var(--primary); background: #f0fdfa; }
.price { font-size: 18px; font-weight: 700; color: var(--primary); }
.grow { flex: 1; }
.kv { display: flex; justify-content: space-between; padding: 6px 0; gap: 12px; }
.total { border-top: 1px dashed var(--line); margin-top: 6px; padding-top: 10px; font-weight: 700; color: var(--primary); }
.footer { display: flex; gap: 10px; margin-top: 18px; }
</style>
