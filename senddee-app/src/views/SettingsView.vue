<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import AppHeader from '../components/AppHeader.vue'
import BottomSheet from '../components/BottomSheet.vue'
import LabelPreview from '../components/LabelPreview.vue'
import { useSession } from '../stores/session'
import { useOrders } from '../stores/orders'
import { toast } from '../utils/toast'
import { printVisible } from '../utils/print'
import { fmtDT } from '../utils/format'
import { PROVINCES } from '../data/provinces'
import { CARRIERS, APP_VERSION, APP_BUILD, SUPPORT_PHONE, PROFIT_MARGIN } from '../data/constants'
import { onMounted } from 'vue'
import { baht } from '../utils/format'

const session = useSession(); const orders = useOrders(); const router = useRouter()
onMounted(() => orders.load())
const today = computed(() => orders.summary); const month = computed(() => orders.monthSummary)
const f = reactive({ branch: session.branch, branchPhone: session.branchPhone, address: session.address, province: session.province, postcode: session.postcode })
const testOpen = ref(false); const logoutOpen = ref(false); const resetOpen = ref(false)
const platform = computed(() => ({ android: 'Android', ios: 'iOS', web: 'เว็บเบราว์เซอร์' }[Capacitor.getPlatform()] || Capacitor.getPlatform()))
const sample = { trackingNo: 'SD000000000TH', carrier: 'flash', createdAt: new Date().toISOString(), cod: 0, sender: { name: 'ทดสอบพิมพ์' },
  receiver: { name: 'คุณทดสอบ ระบบ', phone: '0800000000', address: '1/1 ถ.ตัวอย่าง', province: 'กรุงเทพมหานคร', postcode: '10230' }, parcel: { weight: 1, dims: { w: 20, l: 20, h: 10 }, type: 'ทดสอบ' } }

const pref = (patch) => { session.saveBranch(patch); toast('บันทึกแล้ว') }
function saveBranch() {
  if (!/^\d{9,10}$/.test(f.branchPhone.replace(/\D/g, ''))) return toast('เบอร์สาขาไม่ถูกต้อง')
  if (!/^\d{5}$/.test(f.postcode)) return toast('รหัสไปรษณีย์ 5 หลัก')
  session.saveBranch({ ...f }); toast('บันทึกข้อมูลสาขาแล้ว')
}
const print = printVisible
function logout() { logoutOpen.value = false; session.logout(); router.replace('/login') }
async function reset() { await orders.reset(); resetOpen.value = false; toast('ล้างข้อมูลทดลองแล้ว') }
</script>

<template>
  <div class="page">
    <AppHeader title="โปรไฟล์และตั้งค่า" />

    <!-- profile -->
    <div class="blk prof">
      <div class="av">{{ session.name.slice(0, 1) }}</div>
      <div class="grow"><div class="nm">{{ session.name }}</div><div class="muted">{{ session.role }}</div></div>
    </div>
    <div class="blk">
      <div class="kv"><span class="muted">รหัสพนักงาน</span><span>{{ session.id }}</span></div>
      <div class="kv"><span class="muted">สาขา</span><span>{{ session.branch }} ({{ session.branchCode }})</span></div>
      <div class="kv"><span class="muted">เข้าสู่ระบบเมื่อ</span><span>{{ session.loginAt ? fmtDT(session.loginAt) : '–' }}</span></div>
    </div>

    <!-- today overview -->
    <div class="blk ov">
      <h4>ภาพรวมวันนี้</h4>
      <div class="ov2">
        <div><span class="muted">รายได้วันนี้</span><b>{{ baht(today.revenue) }}</b></div>
        <div><span class="muted">กำไร (ประมาณ)</span><b class="pf">{{ baht(today.profit) }}</b></div>
      </div>
      <div class="kv"><span class="muted">พัสดุวันนี้</span><span>{{ today.count }} ชิ้น · {{ today.weight.toFixed(1) }} กก.<template v-if="today.voided"> · ยกเลิก {{ today.voided }}</template></span></div>
      <div v-if="today.vat" class="kv"><span class="muted">ภาษีมูลค่าเพิ่มที่เก็บวันนี้ (ไม่นับเป็นรายได้)</span><span>{{ baht(today.vat) }}</span></div>
      <div class="kv"><span class="muted">เดือนนี้</span><span>{{ baht(month.revenue) }} · กำไร {{ baht(month.profit) }}</span></div>
      <p class="hint">รายได้ = ค่าขนส่ง + ค่าธรรมเนียม COD ที่หักจากเครดิตผู้ส่ง (ไม่รวมภาษีมูลค่าเพิ่ม และออเดอร์ที่ยกเลิก) · กำไรเป็นตัวเลขประมาณการ คิดจากอัตราสมมติ {{ Math.round(PROFIT_MARGIN * 100) }}% ของรายได้</p>
    </div>

    <!-- branch -->
    <div class="blk">
      <h4>ข้อมูลสาขา (แสดงบนใบปะหน้า)</h4>
      <div class="rw"><label>ชื่อสาขา</label><input v-model="f.branch" /></div>
      <div class="rw"><label>เบอร์สาขา</label><input v-model="f.branchPhone" inputmode="tel" maxlength="10" /></div>
      <div class="rw top"><label>ที่อยู่</label><textarea v-model="f.address" rows="2" /></div>
      <div class="rw"><label>จังหวัด</label><select v-model="f.province"><option v-for="p in PROVINCES" :key="p">{{ p }}</option></select></div>
      <div class="rw"><label>รหัสไปรษณีย์</label><input v-model="f.postcode" inputmode="numeric" maxlength="5" /></div>
      <button class="btn block sm2" @click="saveBranch">บันทึกข้อมูลสาขา</button>
    </div>

    <!-- printer -->
    <div class="blk">
      <h4>เครื่องพิมพ์ใบปะหน้า</h4>
      <div class="rw"><label>ชื่อเครื่องพิมพ์</label><input :value="session.printerName" placeholder="เช่น Xprinter XP-420B" @change="pref({ printerName: $event.target.value })" /></div>
      <div class="rw"><label>ขนาดกระดาษ</label>
        <select :value="session.paper" @change="pref({ paper: $event.target.value })"><option value="100">100 × 150 มม.</option><option value="80">80 มม.</option></select></div>
      <div class="rw"><label>พิมพ์อัตโนมัติหลังรับพัสดุ</label><label class="tg"><input type="checkbox" :checked="session.autoPrint" @change="pref({ autoPrint: $event.target.checked })" /><i /></label></div>
      <button class="btn ghost block sm2" @click="testOpen = true">ทดสอบพิมพ์</button>
      <p class="hint">ตอนนี้พิมพ์ผ่านระบบพิมพ์ของ Android (เครื่องพิมพ์ Wi-Fi / Mopria หรือบริการพิมพ์ที่ติดตั้งไว้) การพิมพ์ตรงเข้าเครื่องพิมพ์ความร้อนบลูทูธต้องเพิ่มปลั๊กอินตามรุ่นเครื่อง</p>
    </div>

    <!-- defaults -->
    <div class="blk">
      <h4>ค่าเริ่มต้นตอนรับพัสดุ</h4>
      <div class="rw"><label>ขนส่ง</label><select :value="session.defaultCarrier" @change="pref({ defaultCarrier: $event.target.value })"><option v-for="v in CARRIERS" :key="v.id" :value="v.id">{{ v.name }}</option></select></div>
    </div>

    <!-- help -->
    <div class="blk">
      <h4>ช่วยเหลือ</h4>
      <a class="lnkrow" :href="`tel:${SUPPORT_PHONE}`"><span>โทรหาสำนักงานใหญ่</span><span class="muted">{{ SUPPORT_PHONE }}</span></a>
      <RouterLink class="lnkrow" to="/issues"><span>แจ้งปัญหา</span><span class="muted">›</span></RouterLink>
      <RouterLink class="lnkrow" to="/news"><span>ข่าวสารสำนักงานใหญ่</span><span class="muted">›</span></RouterLink>
    </div>

    <!-- about -->
    <div class="blk">
      <h4>เกี่ยวกับแอป</h4>
      <div class="kv"><span class="muted">เวอร์ชัน</span><span>{{ APP_VERSION }}</span></div>
      <div class="kv"><span class="muted">วันที่สร้างแอป</span><span>{{ APP_BUILD }}</span></div>
      <div class="kv"><span class="muted">แพลตฟอร์ม</span><span>{{ platform }}</span></div>
      <div class="kv"><span class="muted">ข้อมูลในแอป</span><span>ข้อมูลจำลอง (เก็บในเครื่อง)</span></div>
      <button class="lnk" @click="resetOpen = true">ล้างข้อมูลทดลอง</button>
    </div>

    <button class="btn danger block" style="margin-top:12px" @click="logoutOpen = true">ออกจากระบบ</button>
    <p class="muted" style="text-align:center;margin:14px 0 4px">SendDee Staff v{{ APP_VERSION }}</p>

    <BottomSheet :open="logoutOpen" title="ออกจากระบบ?" @close="logoutOpen = false">
      <p class="muted">ข้อมูลพัสดุที่บันทึกแล้วจะยังอยู่ในเครื่อง ต้องเข้าสู่ระบบใหม่เพื่อใช้งานต่อ</p>
      <template #footer><button class="btn ghost" @click="logoutOpen = false">ยกเลิก</button><button class="btn danger" style="flex:1" @click="logout">ออกจากระบบ</button></template>
    </BottomSheet>
    <BottomSheet :open="resetOpen" title="ล้างข้อมูลทดลอง?" @close="resetOpen = false">
      <p class="muted">พัสดุ ใบเสร็จ ใบส่งมอบ การแจ้งปัญหา และข้อมูลผู้ส่ง/เครดิตที่บันทึกไว้ในเครื่องจะถูกล้าง แล้วกลับไปใช้ข้อมูลตัวอย่าง</p>
      <template #footer><button class="btn ghost" @click="resetOpen = false">ยกเลิก</button><button class="btn danger" style="flex:1" @click="reset">ล้างข้อมูล</button></template>
    </BottomSheet>
    <BottomSheet :open="testOpen" title="ทดสอบพิมพ์" @close="testOpen = false">
      <LabelPreview :order="sample" />
      <template #footer><button class="btn block" @click="print">🖨️ พิมพ์</button></template>
    </BottomSheet>
  </div>
</template>

<style scoped>
.blk { background: #fff; margin: 10px -16px 0; padding: 4px 16px 10px; }
.blk h4 { margin: 0; padding: 12px 0 4px; font-size: 13px; color: var(--muted); font-weight: 400; }
.ov2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 6px 0 10px; } .ov2 > div { background: #f4f8ff; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 4px; } .ov2 b { font-size: 24px; font-weight: 500; color: var(--primary); } .ov2 .pf { color: #059669; }
.prof { display: flex; align-items: center; gap: 14px; padding: 16px; margin-top: 0; }
.av { width: 52px; height: 52px; border-radius: 50%; background: var(--primary-soft); color: var(--primary); display: grid; place-items: center; font-size: 22px; font-weight: 500; }
.nm { font-size: 18px; font-weight: 500; } .grow { flex: 1; }
.rw { display: flex; align-items: center; gap: 12px; min-height: 50px; border-bottom: 1px solid var(--line); } .rw:last-of-type { border-bottom: 0; }
.rw.top { align-items: flex-start; padding-top: 12px; }
.rw > label:first-child { flex: 0 0 38%; font-size: 15px; }
.rw input, .rw select, .rw textarea { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; text-align: right; font-size: 15px; padding: 8px 0; color: var(--text); }
.rw select { text-align-last: right; appearance: none; -webkit-appearance: none; } .rw textarea { resize: none; }
.tg { margin-left: auto; position: relative; flex: none !important; width: 46px; height: 26px; } .tg input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; z-index: 1; }
.tg i { position: absolute; inset: 0; background: #cfd4da; border-radius: 13px; transition: .15s; } .tg i::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: .15s; }
.tg input:checked + i { background: var(--primary); } .tg input:checked + i::after { left: 23px; }
.sm2 { margin-top: 10px; } .hint { color: var(--muted); font-size: 13px; margin-top: 10px; line-height: 1.5; }
.lnkrow { display: flex; justify-content: space-between; align-items: center; min-height: 48px; border-bottom: 1px solid var(--line); color: var(--text); text-decoration: none; } .lnkrow:last-child { border: 0; }
.lnk { border: 0; background: transparent; color: var(--primary); padding: 10px 0 2px; font-size: 14px; }
</style>
