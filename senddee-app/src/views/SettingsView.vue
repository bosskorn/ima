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
import { fmtDT } from '../utils/format'
import { PROVINCES } from '../data/provinces'
import { PAYMENTS, SERVICES, APP_VERSION, APP_BUILD, SUPPORT_PHONE } from '../data/constants'

const session = useSession(); const orders = useOrders(); const router = useRouter()
const f = reactive({ branch: session.branch, branchPhone: session.branchPhone, address: session.address, province: session.province, postcode: session.postcode })
const testOpen = ref(false); const logoutOpen = ref(false); const resetOpen = ref(false)
const platform = computed(() => ({ android: 'Android', ios: 'iOS', web: 'เว็บเบราว์เซอร์' }[Capacitor.getPlatform()] || Capacitor.getPlatform()))
const sample = { trackingNo: 'SD000000000TH', service: 'standard', createdAt: new Date().toISOString(), cod: 0, sender: { name: 'ทดสอบพิมพ์' },
  receiver: { name: 'คุณทดสอบ ระบบ', phone: '0800000000', address: '1/1 ถ.ตัวอย่าง', province: 'กรุงเทพมหานคร', postcode: '10230' }, parcel: { weight: 1, type: 'ทดสอบ' } }

const pref = (patch) => { session.saveBranch(patch); toast('บันทึกแล้ว') }
function saveBranch() {
  if (!/^\d{9,10}$/.test(f.branchPhone.replace(/\D/g, ''))) return toast('เบอร์สาขาไม่ถูกต้อง')
  if (!/^\d{5}$/.test(f.postcode)) return toast('รหัสไปรษณีย์ 5 หลัก')
  session.saveBranch({ ...f }); toast('บันทึกข้อมูลสาขาแล้ว')
}
const print = () => window.print()
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
      <p class="hint">พิมพ์ผ่านระบบพิมพ์ของ Android ได้ทันที (เครื่องพิมพ์ Wi-Fi / Mopria หรือบริการพิมพ์ที่ติดตั้งไว้) การเชื่อมเครื่องพิมพ์ความร้อนบลูทูธโดยตรงต้องเพิ่มปลั๊กอินตามรุ่น</p>
    </div>

    <!-- defaults -->
    <div class="blk">
      <h4>ค่าเริ่มต้นตอนรับพัสดุ</h4>
      <div class="rw"><label>บริการ</label><select :value="session.defaultService" @change="pref({ defaultService: $event.target.value })"><option v-for="v in SERVICES" :key="v.id" :value="v.id">{{ v.name }}</option></select></div>
      <div class="rw"><label>วิธีรับเงิน</label><select :value="session.defaultPayment" @change="pref({ defaultPayment: $event.target.value })"><option v-for="p in PAYMENTS" :key="p.id" :value="p.id">{{ p.label }}</option></select></div>
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
      <p class="muted">พัสดุ ใบส่งมอบ การแจ้งปัญหา และประวัติปิดยอดที่บันทึกไว้จะถูกล้าง แล้วกลับไปใช้ข้อมูลตัวอย่าง</p>
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
.prof { display: flex; align-items: center; gap: 14px; padding: 16px; margin-top: 0; }
.av { width: 52px; height: 52px; border-radius: 50%; background: var(--primary-soft); color: var(--primary); display: grid; place-items: center; font-size: 22px; font-weight: 500; }
.nm { font-size: 18px; font-weight: 500; } .grow { flex: 1; }
.rw { display: flex; align-items: center; gap: 12px; min-height: 50px; border-bottom: 1px solid var(--line); } .rw:last-of-type { border-bottom: 0; }
.rw.top { align-items: flex-start; padding-top: 12px; }
.rw > label:first-child { flex: 0 0 38%; font-size: 15px; }
.rw input, .rw select, .rw textarea { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; text-align: right; font-size: 15px; padding: 8px 0; color: var(--text); }
.rw select { direction: rtl; appearance: none; -webkit-appearance: none; } .rw textarea { resize: none; }
.tg { margin-left: auto; position: relative; flex: none !important; width: 46px; height: 26px; } .tg input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; z-index: 1; }
.tg i { position: absolute; inset: 0; background: #cfd4da; border-radius: 13px; transition: .15s; } .tg i::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: .15s; }
.tg input:checked + i { background: var(--primary); } .tg input:checked + i::after { left: 23px; }
.sm2 { margin-top: 10px; } .hint { color: var(--muted); font-size: 13px; margin-top: 10px; line-height: 1.5; }
.lnkrow { display: flex; justify-content: space-between; align-items: center; min-height: 48px; border-bottom: 1px solid var(--line); color: var(--text); text-decoration: none; } .lnkrow:last-child { border: 0; }
.lnk { border: 0; background: transparent; color: var(--primary); padding: 10px 0 2px; font-size: 14px; }
</style>
