<script setup>
import { reactive, ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import BottomSheet from '../components/BottomSheet.vue'
import LabelPreview from '../components/LabelPreview.vue'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { useReceive } from '../stores/receive'
import { calcFee, findSender } from '../api'
import { parseAddress } from '../utils/address'
import { toast } from '../utils/toast'
import { baht } from '../utils/format'
import { PROVINCES } from '../data/provinces'
import { CARRIERS, PRODUCT_TYPES, BANKS, MAX_WEIGHT_KG, COD_RATE } from '../data/constants'

const router = useRouter(); const orders = useOrders(); const session = useSession(); const rc = useReceive()
orders.load()

// ---- state ----
const paste = ref('')
const r = reactive({ name: '', phone: '', address: '', province: '', postcode: '' })
const weight = ref(''); const dims = reactive({ w: '', l: '', h: '' })
const type = ref(''); const note = ref('')
const useCod = ref(false); const cod = ref('')
const carrier = ref(session.defaultCarrier)
const busy = ref(false); const tried = ref(false)
const typeOpen = ref(false); const typeQ = ref('')
const found = ref(null); const foundOpen = ref(false); const isNewSender = ref(false)
const bankOpen = ref(false); const bk = reactive({ bank: '', number: '', name: '' }); const bkErr = ref('')
const created = ref(null); const createdOpen = ref(false)

const locked = computed(() => rc.orderIds.length > 0)
const sender = rc.sender

// ---- sender: phone first, then look the customer up ----
watch(() => sender.phone, async (p) => {
  if (locked.value || sender.confirmed) return
  isNewSender.value = false
  if (!/^0\d{9}$/.test(p)) return
  const s = await findSender(p)
  if (s && sender.phone === p) { found.value = s; foundOpen.value = true } else { isNewSender.value = true; sender.credit = 0 }
})
function confirmFound() {
  Object.assign(sender, { name: found.value.name, address: found.value.address || '', bank: found.value.bank || null, credit: found.value.credit || 0, confirmed: true })
  rc.persist(); foundOpen.value = false; toast('ใช้ข้อมูลผู้ส่งเดิมแล้ว')
}
function notThisPerson() { foundOpen.value = false; found.value = null; isNewSender.value = true }
function changeSender() {
  if (locked.value) return toast('ต้องกด "เสร็จสิ้น" รายการนี้ก่อนจึงเปลี่ยนผู้ส่งได้')
  Object.assign(sender, { phone: '', name: '', address: '', bank: null, credit: 0, confirmed: false }); isNewSender.value = false; rc.persist()
}
const senderReady = computed(() => /^0\d{9}$/.test(sender.phone) && sender.name.trim().length >= 2 && (rc.pickup !== 'home' || sender.address.trim().length >= 5))

// ---- receiver smart paste ----
function doParse() {
  const p = parseAddress(paste.value)
  if (!p.phone && !p.postcode && !p.province && !p.name) return toast('อ่านที่อยู่ไม่ได้ กรุณากรอกเอง')
  Object.assign(r, p); toast('กรอกให้แล้ว ตรวจสอบก่อนยืนยัน')
}
async function pasteClipboard() { try { paste.value = await navigator.clipboard.readText(); doParse() } catch { toast('วางข้อความในช่องด้านบนได้เลย') } }
const onPaste = () => setTimeout(doParse, 0)

// ---- product type ----
const typeList = computed(() => PRODUCT_TYPES.filter((t) => !typeQ.value.trim() || t.includes(typeQ.value.trim())))
function pickType(t) { type.value = t; typeOpen.value = false; typeQ.value = '' }

// ---- COD: ask for the sender's bank account first ----
function onCodToggle(e) {
  if (!e.target.checked) { useCod.value = false; return }
  e.target.checked = false // only switch on after the bank account is confirmed
  Object.assign(bk, sender.bank || { bank: '', number: '', name: sender.name }); bkErr.value = ''; bankOpen.value = true
}
function saveBank() {
  if (!bk.bank) return (bkErr.value = 'เลือกธนาคาร')
  if (!/^\d{10,15}$/.test(bk.number.replace(/[-\s]/g, ''))) return (bkErr.value = 'เลขที่บัญชีต้องเป็นตัวเลข 10–15 หลัก')
  if (bk.name.trim().length < 2) return (bkErr.value = 'กรอกชื่อบัญชี')
  sender.bank = { bank: bk.bank, number: bk.number.replace(/[-\s]/g, ''), name: bk.name.trim() }; rc.persist()
  useCod.value = true; bankOpen.value = false; toast('บันทึกบัญชีรับเงิน COD แล้ว')
}
const maskedAcc = computed(() => (sender.bank ? `${sender.bank.bank} ••••${sender.bank.number.slice(-4)} · ${sender.bank.name}` : ''))

// ---- pricing ----
const codAmount = computed(() => (useCod.value ? Number(cod.value) || 0 : 0))
const fee = computed(() => calcFee({ weight: weight.value, carrier: carrier.value, cod: codAmount.value }))
const quote = (id) => calcFee({ weight: weight.value, carrier: id }).shipping
const prev = computed(() => orders.list.filter((o) => rc.orderIds.includes(o.id) && o.status !== 'cancelled'))
const prevTotal = computed(() => prev.value.reduce((a, o) => a + o.charge, 0))
const creditAfter = computed(() => (sender.credit || 0) - fee.value.total)
const lowCredit = computed(() => fee.value.total > 0 && creditAfter.value < 0)

const errors = computed(() => {
  const e = {}
  if (!/^0\d{9}$/.test(sender.phone)) e.sphone = 'กรอกเบอร์ผู้ส่ง 10 หลัก'
  else if (sender.name.trim().length < 2) e.sname = 'กรอกชื่อผู้ส่ง'
  if (rc.pickup === 'home' && sender.address.trim().length < 5) e.saddr = 'กรอกที่อยู่ที่ไปรับพัสดุ'
  if (r.name.trim().length < 2) e.name = 'กรอกชื่อผู้รับ'
  if (!/^0\d{8,9}$/.test(r.phone)) e.phone = 'เบอร์โทรไม่ถูกต้อง'
  if (r.address.trim().length < 3) e.address = 'กรอกที่อยู่'
  if (!r.province) e.province = 'เลือกจังหวัด'
  if (!/^\d{5}$/.test(r.postcode)) e.postcode = 'รหัสไปรษณีย์ 5 หลัก'
  const w = Number(weight.value)
  if (!(w > 0)) e.weight = 'ชั่งน้ำหนัก'; else if (w > MAX_WEIGHT_KG) e.weight = `สูงสุด ${MAX_WEIGHT_KG} กก.`
  if (![dims.w, dims.l, dims.h].every((x) => Number(x) > 0)) e.dims = 'กรอกขนาดกว้าง × ยาว × สูง'
  if (!type.value) e.ptype = 'เลือกประเภทสินค้า'
  if (useCod.value && !(codAmount.value > 0)) e.cod = 'กรอกยอด COD'; else if (codAmount.value > 50000) e.cod = 'COD สูงสุด 50,000'
  return e
})
const show = (k) => tried.value && errors.value[k]

async function submit() {
  tried.value = true
  const first = Object.keys(errors.value)[0]
  if (first) { document.querySelector(`[data-f="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return toast('ข้อมูลยังไม่ครบ ตรวจช่องสีแดง') }
  if (lowCredit.value) return toast('เครดิตผู้ส่งไม่เพียงพอ ให้ลูกค้าเติมเครดิตกับแฟรนไชส์ก่อน', 3500)
  busy.value = true
  try {
    const o = await orders.create({
      txId: rc.txId, pickup: rc.pickup,
      sender: { name: sender.name.trim(), phone: sender.phone, address: sender.address.trim(), ...(useCod.value && sender.bank ? { bank: sender.bank } : {}) },
      receiver: { ...r, name: r.name.trim(), address: r.address.trim() },
      parcel: { weight: Number(weight.value), dims: { w: +dims.w, l: +dims.l, h: +dims.h }, type: type.value, note: note.value.trim() },
      carrier: carrier.value, cod: codAmount.value,
    })
    sender.confirmed = true; sender.credit = (await findSender(sender.phone))?.credit ?? 0; rc.addOrder(o)
    created.value = o; createdOpen.value = true
    if (session.autoPrint) { await nextTick(); setTimeout(() => window.print(), 500) }
  } catch (e) { toast(e.message) } finally { busy.value = false }
}
function addNext() {
  createdOpen.value = false
  Object.assign(r, { name: '', phone: '', address: '', province: '', postcode: '' }); paste.value = ''
  weight.value = ''; Object.assign(dims, { w: '', l: '', h: '' }); type.value = ''; note.value = ''; useCod.value = false; cod.value = ''; tried.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function finish() { createdOpen.value = false; router.push(`/receipt/${rc.txId}`) }
const print = () => window.print()
</script>

<template>
  <div class="page">
    <AppHeader back title="รับพัสดุ" :sub="locked ? `รายการที่ ${rc.orderIds.length + 1} ของลูกค้ารายนี้` : ''" />

    <!-- items already created for this customer -->
    <div v-if="locked" class="blk done">
      <div class="row between"><b>สร้างแล้ว {{ prev.length }} ชิ้น · หักเครดิต {{ baht(prevTotal) }}</b><button class="lnk" @click="finish">เสร็จสิ้น → ใบเสร็จ</button></div>
      <div class="muted small">{{ prev.map((o) => o.trackingNo).join(' · ') }}</div>
    </div>

    <div class="blk">
      <h4>สถานที่รับพัสดุ</h4>
      <div class="seg"><button :class="{ on: rc.pickup === 'shop' }" :disabled="locked" @click="rc.pickup = 'shop'; rc.persist()">หน้าร้าน</button><button :class="{ on: rc.pickup === 'home' }" :disabled="locked" @click="rc.pickup = 'home'; rc.persist()">บ้านลูกค้า</button></div>
    </div>

    <!-- 1. sender -->
    <div class="blk">
      <h4>1 · ผู้ส่ง</h4>
      <div class="rw" data-f="sphone" :class="{ invalid: show('sphone') }"><label>เบอร์ผู้ส่ง</label>
        <input v-model="sender.phone" inputmode="tel" maxlength="10" placeholder="08xxxxxxxx" :disabled="locked || sender.confirmed" @input="rc.persist()" /></div>
      <template v-if="sender.confirmed || isNewSender || locked">
        <div class="rw" data-f="sname" :class="{ invalid: show('sname') }"><label>ชื่อผู้ส่ง</label><input v-model="sender.name" placeholder="ชื่อ-นามสกุล / ชื่อร้าน" :disabled="locked" @input="rc.persist()" /></div>
        <div v-if="rc.pickup === 'home' || sender.address" class="rw top" data-f="saddr" :class="{ invalid: show('saddr') }"><label>ที่อยู่รับพัสดุ</label><textarea v-model="sender.address" rows="2" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด" :disabled="locked" @input="rc.persist()" /></div>
        <p v-if="isNewSender && !sender.confirmed" class="hint">ไม่พบเบอร์นี้ในระบบ — บันทึกเป็นผู้ส่งใหม่ (ยังไม่มีเครดิต)</p>
        <div class="rw"><label>เครดิตคงเหลือ</label><span class="crd" :class="{ zero: !sender.credit }">{{ baht(sender.credit || 0) }}</span></div>
        <div v-if="sender.confirmed || locked" class="row pbtn"><button class="lnk" @click="changeSender">{{ locked ? 'เปลี่ยนผู้ส่ง (ต้องเสร็จสิ้นก่อน)' : 'ไม่ใช่คนนี้ / เปลี่ยนผู้ส่ง' }}</button></div>
      </template>
      <p v-else class="hint">กรอกเบอร์ผู้ส่งก่อน ระบบจะค้นหาข้อมูลลูกค้าเดิมให้</p>
    </div>

    <!-- 2. receiver -->
    <div class="blk">
      <h4>2 · ผู้รับ</h4>
      <textarea v-model="paste" class="paste" rows="2" placeholder="วางข้อความที่อยู่ เช่น คุณสมหญิง 081-234-5678 99/1 ม.2 ต.บางพลี จ.สมุทรปราการ 10540" @paste="onPaste" />
      <div class="row pbtn"><button class="lnk" @click="pasteClipboard">วางจากคลิปบอร์ด</button><button class="lnk strong" @click="doParse">แยกที่อยู่อัตโนมัติ</button></div>
      <div class="rw" data-f="name" :class="{ invalid: show('name') }"><label>ชื่อผู้รับ</label><input v-model="r.name" placeholder="ชื่อ-นามสกุล" /></div>
      <div class="rw" data-f="phone" :class="{ invalid: show('phone') }"><label>เบอร์โทร</label><input v-model="r.phone" inputmode="tel" maxlength="10" placeholder="08xxxxxxxx" /></div>
      <div class="rw top" data-f="address" :class="{ invalid: show('address') }"><label>ที่อยู่</label><textarea v-model="r.address" rows="2" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ" /></div>
      <div class="rw" data-f="province" :class="{ invalid: show('province') }"><label>จังหวัด</label>
        <select v-model="r.province"><option value="" disabled>เลือกจังหวัด</option><option v-for="p in PROVINCES" :key="p">{{ p }}</option></select></div>
      <div class="rw" data-f="postcode" :class="{ invalid: show('postcode') }"><label>รหัสไปรษณีย์</label><input v-model="r.postcode" inputmode="numeric" maxlength="5" placeholder="5 หลัก" /></div>
    </div>

    <!-- 3. parcel -->
    <div class="blk">
      <h4>3 · พัสดุ</h4>
      <div class="rw" data-f="weight" :class="{ invalid: show('weight') }"><label>น้ำหนัก (กก.)</label><input v-model="weight" class="big" inputmode="decimal" placeholder="0.0" /></div>
      <div class="chips"><button v-for="n in [0.5, 1, 2, 3, 5, 10]" :key="n" class="chip" :class="{ on: Number(weight) === n }" @click="weight = String(n)">{{ n }}</button></div>
      <div class="rw" data-f="dims" :class="{ invalid: show('dims') }"><label>ขนาด (ซม.)</label>
        <div class="dims"><input v-model="dims.w" inputmode="decimal" placeholder="กว้าง" /><i>×</i><input v-model="dims.l" inputmode="decimal" placeholder="ยาว" /><i>×</i><input v-model="dims.h" inputmode="decimal" placeholder="สูง" /></div></div>
      <button class="rw pick" data-f="ptype" :class="{ invalid: show('ptype') }" @click="typeOpen = true"><label>ประเภทสินค้า</label><span :class="{ ph: !type }">{{ type || 'เลือกประเภทสินค้า' }}</span><i>›</i></button>
      <div class="rw"><label>หมายเหตุ</label><input v-model="note" placeholder="เช่น ระวังแตก" /></div>
      <div class="rw"><label>เก็บเงินปลายทาง (COD)</label><label class="tg"><input type="checkbox" :checked="useCod" @change="onCodToggle" /><i /></label></div>
      <template v-if="useCod">
        <div class="rw" data-f="cod" :class="{ invalid: show('cod') }"><label>ยอด COD (บาท)</label><input v-model="cod" inputmode="numeric" placeholder="0" /></div>
        <div class="rw pick" @click="onCodToggle({ target: { checked: true } })"><label>บัญชีรับเงิน</label><span class="acc">{{ maskedAcc }}</span><i>›</i></div>
        <p class="hint">ระบบโอนเงิน COD เข้าบัญชีผู้ส่งโดยตรง เจ้าของแฟรนไชส์ไม่ต้องโอนเอง · ค่าธรรมเนียม COD {{ COD_RATE * 100 }}% ของยอด COD เก็บจากผู้ส่งพร้อมค่าขนส่ง</p>
      </template>
    </div>

    <!-- 4. carrier -->
    <div class="blk">
      <h4>4 · ขนส่ง</h4>
      <button v-for="c in CARRIERS" :key="c.id" class="cr" :class="{ on: carrier === c.id }" @click="carrier = c.id">
        <i class="rd" /><img :src="c.logo" :alt="c.name" /><span class="nm">{{ c.name }}<small>ราคาเริ่มต้น {{ baht(c.start) }}</small></span><span class="pr">{{ Number(weight) > 0 ? baht(quote(c.id)) : '–' }}</span>
      </button>
    </div>

    <!-- summary -->
    <div class="blk sum">
      <h4>สรุปยอด</h4>
      <div class="kv"><span>ค่าขนส่ง ({{ CARRIERS.find((c) => c.id === carrier).short }})</span><span>{{ baht(fee.shipping) }}</span></div>
      <div v-if="codAmount" class="kv"><span>ค่าเก็บเงินปลายทาง {{ COD_RATE * 100 }}% (COD {{ baht(codAmount) }})</span><span>{{ baht(fee.codFee) }}</span></div>
      <div class="kv tot"><span>หักเครดิตชิ้นนี้</span><span>{{ baht(fee.total) }}</span></div>
      <div class="kv"><span class="muted">เครดิตผู้ส่งหลังหัก</span><span :style="{ color: lowCredit ? 'var(--danger)' : '' }">{{ baht(creditAfter) }}</span></div>
      <p v-if="lowCredit" class="lowp">เครดิตผู้ส่งไม่เพียงพอ — ให้ลูกค้าเติมเครดิตกับแฟรนไชส์ก่อน แล้วจึงสร้างออเดอร์ได้</p>
      <div v-if="locked" class="kv"><span class="muted">ชิ้นก่อนหน้าในรอบนี้ {{ prev.length }} ชิ้น (หักแล้ว)</span><span class="muted">{{ baht(prevTotal) }}</span></div>
    </div>

    <div class="stickybar">
      <div class="total"><small class="muted">หักเครดิต</small><b>{{ baht(fee.total) }}</b></div>
      <button class="btn accent" :disabled="busy || lowCredit" @click="submit">{{ busy ? 'กำลังสร้าง…' : lowCredit ? 'เครดิตไม่พอ' : 'ยืนยันสร้างออเดอร์' }}</button>
    </div>

    <!-- popup: sender found by phone -->
    <BottomSheet :open="foundOpen" title="พบข้อมูลผู้ส่งในระบบ" @close="notThisPerson">
      <p class="muted" style="margin-bottom:10px">เบอร์นี้มีข้อมูลอยู่แล้ว ใช่ผู้ส่งคนนี้ไหม?</p>
      <div v-if="found" class="fcard">
        <div class="fn">{{ found.name }}</div><div>{{ found.phone }}</div>
        <div v-if="found.address" class="muted">{{ found.address }}</div>
        <div v-if="found.bank" class="muted">บัญชี COD: {{ found.bank.bank }} ••••{{ found.bank.number.slice(-4) }}</div>
        <div class="fcr">เครดิตคงเหลือ {{ baht(found.credit || 0) }}</div>
      </div>
      <template #footer><button class="btn ghost" @click="notThisPerson">ไม่ใช่</button><button class="btn" style="flex:1" @click="confirmFound">ใช่ ยืนยัน</button></template>
    </BottomSheet>

    <!-- popup: COD bank account -->
    <BottomSheet :open="bankOpen" title="บัญชีรับเงิน COD ของผู้ส่ง" @close="bankOpen = false">
      <p class="muted" style="margin-bottom:12px">กรุณากรอกชื่อ เลขที่บัญชี ธนาคารของผู้ส่ง เพื่อใช้รับเงินในกรณีส่งเก็บเงินปลายทาง</p>
      <label class="field"><span>ธนาคาร</span><select v-model="bk.bank"><option value="" disabled>เลือกธนาคาร</option><option v-for="b in BANKS" :key="b">{{ b }}</option></select></label>
      <label class="field"><span>เลขที่บัญชี</span><input v-model="bk.number" inputmode="numeric" maxlength="17" placeholder="เฉพาะตัวเลข" /></label>
      <label class="field"><span>ชื่อบัญชี</span><input v-model="bk.name" placeholder="ชื่อ-นามสกุล ตามสมุดบัญชี" /></label>
      <p v-if="bkErr" class="errp">{{ bkErr }}</p>
      <template #footer><button class="btn ghost" @click="bankOpen = false">ยกเลิก</button><button class="btn" style="flex:1" @click="saveBank">{{ sender.bank ? 'ยืนยันบัญชีนี้' : 'บันทึกบัญชี' }}</button></template>
    </BottomSheet>

    <!-- picker: product type -->
    <BottomSheet :open="typeOpen" title="ประเภทสินค้า" @close="typeOpen = false">
      <input v-model="typeQ" class="tsearch" type="search" placeholder="ค้นหาประเภทสินค้า" />
      <button v-for="t in typeList" :key="t" class="topt" :class="{ on: type === t }" @click="pickType(t)"><span>{{ t }}</span><i v-if="type === t">✓</i></button>
      <p v-if="!typeList.length" class="muted" style="text-align:center;padding:16px">ไม่พบ — เลือก "อื่น ๆ" แล้วใส่หมายเหตุ</p>
    </BottomSheet>

    <!-- after create: label + next/finish -->
    <BottomSheet :open="createdOpen" title="สร้างออเดอร์สำเร็จ" @close="addNext">
      <p class="muted" style="margin-bottom:10px">{{ session.autoPrint ? 'กำลังพิมพ์ใบปะหน้า… ' : '' }}ติดใบปะหน้าที่พัสดุ แล้วเลือกขั้นตอนต่อไป</p>
      <LabelPreview v-if="created" :order="created" />
      <button class="lnk" style="margin-top:8px" @click="print">🖨️ พิมพ์ใบปะหน้าอีกครั้ง</button>
      <template #footer><button class="btn ghost" @click="finish">เสร็จสิ้น</button><button class="btn" style="flex:1" @click="addNext">+ เพิ่มรายการถัดไป</button></template>
    </BottomSheet>
  </div>
</template>

<style scoped>
.blk { background: #fff; margin: 10px -16px 0; padding: 4px 16px 8px; }
.blk h4 { margin: 0; padding: 12px 0 4px; font-size: 13px; color: var(--muted); font-weight: 400; }
.done { background: #eef5ff; } .small { font-size: 12px; margin-top: 2px; word-break: break-all; }
.rw { display: flex; align-items: center; gap: 12px; min-height: 52px; border-bottom: 1px solid var(--line); width: 100%; background: transparent; border-left: 0; border-right: 0; border-top: 0; padding: 0; font: inherit; color: inherit; text-align: left; }
.rw:last-child { border-bottom: 0; } .rw.top { align-items: flex-start; padding-top: 14px; }
.rw > label:first-child { flex: 0 0 38%; font-size: 15px; }
.rw input, .rw select, .rw textarea { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; text-align: right; font-size: 15px; padding: 8px 0; color: var(--text); }
.rw input:disabled, .rw textarea:disabled { color: var(--muted); }
.rw select { direction: rtl; appearance: none; -webkit-appearance: none; } .rw textarea { resize: none; }
.rw input::placeholder, .rw textarea::placeholder { color: #b5bac1; }
.rw.invalid { border-bottom-color: var(--danger); } .rw.invalid > label:first-child { color: var(--danger); }
.rw .big { font-size: 26px; color: var(--primary); }
.pick { cursor: pointer; } .pick > span { flex: 1; text-align: right; font-size: 15px; } .pick .ph { color: #b5bac1; } .pick > i { color: var(--muted); font-style: normal; font-size: 20px; } .acc { font-size: 13px !important; color: var(--muted); }
.dims { flex: 1; display: flex; align-items: center; gap: 4px; } .dims input { text-align: center; width: 0; } .dims i { color: var(--muted); font-style: normal; }
.paste { width: 100%; margin: 6px 0 0; padding: 10px 12px; border: 1px dashed #b8c2d0; border-radius: 8px; background: #f6f9ff; outline: none; resize: none; font-size: 14px; }
.pbtn { justify-content: flex-end; gap: 18px; padding: 8px 0 6px; }
.lnk { border: 0; background: transparent; color: var(--muted); font-size: 14px; padding: 4px 0; } .lnk.strong { color: var(--primary); }
.done .lnk { color: var(--primary); }
.chips { display: flex; gap: 8px; flex-wrap: wrap; padding: 8px 0 12px; } .chip { padding: 6px 16px; }
.hint { color: var(--muted); font-size: 13px; padding: 6px 0 8px; line-height: 1.5; }
.seg { display: flex; background: #eef0f2; border-radius: 10px; padding: 3px; margin: 6px 0 8px; } .seg button { flex: 1; border: 0; background: transparent; padding: 10px 0; border-radius: 8px; font-size: 15px; color: var(--muted); } .seg button.on { background: #fff; color: var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,.12); } .seg button:disabled { opacity: .6; }
.tg { margin-left: auto; position: relative; flex: none !important; width: 46px; height: 26px; } .tg input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; z-index: 1; }
.tg i { position: absolute; inset: 0; background: #cfd4da; border-radius: 13px; transition: .15s; } .tg i::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: .15s; }
.tg input:checked + i { background: var(--primary); } .tg input:checked + i::after { left: 23px; }
.cr { width: 100%; display: flex; align-items: center; gap: 12px; border: 1.5px solid var(--line); border-radius: 10px; background: #fff; padding: 12px; margin: 6px 0; font: inherit; color: inherit; text-align: left; }
.cr.on { border-color: var(--primary); background: #f4f8ff; } .cr img { width: 64px; height: 28px; object-fit: contain; }
.rd { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #c5cad1; flex: none; position: relative; } .cr.on .rd { border-color: var(--primary); } .cr.on .rd::after { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: var(--primary); }
.nm { flex: 1; font-size: 15px; } .nm small { display: block; color: var(--muted); font-size: 12px; } .pr { font-size: 18px; color: var(--primary); }
.sum .kv { padding: 5px 0; } .tot { border-top: 1px dashed var(--line); margin-top: 4px; padding-top: 8px !important; color: var(--primary); font-size: 17px; }
.fcard { background: #f4f8ff; border-radius: 10px; padding: 12px 14px; line-height: 1.6; } .fn { font-size: 17px; font-weight: 500; }
.crd { margin-left: auto; font-size: 17px; color: var(--primary); } .crd.zero { color: var(--danger); }
.lowp { background: #fee2e2; color: #991b1b; border-radius: 8px; padding: 8px 10px; font-size: 13px; margin: 8px 0 4px; }
.fcr { margin-top: 6px; font-size: 18px; color: var(--primary); }
.errp { color: var(--danger); font-size: 13px; }
.tsearch { width: 100%; padding: 11px 14px; border: 1.5px solid var(--line); border-radius: 10px; margin-bottom: 6px; outline: none; }
.topt { width: 100%; display: flex; justify-content: space-between; border: 0; border-bottom: 1px solid var(--line); background: transparent; padding: 13px 2px; font: inherit; color: inherit; text-align: left; } .topt.on { color: var(--primary); } .topt i { font-style: normal; }
</style>
