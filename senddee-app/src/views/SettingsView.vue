<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useSession } from '../stores/session'
import { useOrders } from '../stores/orders'
import { toast } from '../utils/toast'
import { PROVINCES } from '../data/provinces'
import { ref } from 'vue'
import BottomSheet from '../components/BottomSheet.vue'
import LabelPreview from '../components/LabelPreview.vue'
import { PAYMENTS, SERVICES } from '../data/constants'

const session = useSession(); const orders = useOrders(); const router = useRouter()
const f = reactive({ branch: session.branch, branchPhone: session.branchPhone, address: session.address, province: session.province, postcode: session.postcode })
const testOpen = ref(false)
const sample = { trackingNo: 'SD000000000TH', service: 'standard', createdAt: new Date().toISOString(), cod: 0, sender: { name: 'ทดสอบพิมพ์' },
  receiver: { name: 'คุณทดสอบ ระบบ', phone: '0800000000', address: '1/1 ถ.ตัวอย่าง', province: 'กรุงเทพมหานคร', postcode: '10230' }, parcel: { weight: 1, type: 'ทดสอบ' } }
const pref = (patch) => { session.saveBranch(patch); toast('บันทึกแล้ว') }
function save() { session.saveBranch({ ...f }); toast('บันทึกแล้ว') }
function logout() { if (confirm('ออกจากระบบ?')) { session.logout(); router.replace('/login') } }
const print = () => window.print()
async function reset() { if (confirm('ล้างข้อมูลทดลองและกลับไปใช้ข้อมูลตัวอย่าง?')) { await orders.reset(); toast('รีเซ็ตแล้ว') } }
</script>

<template>
  <div class="page">
    <AppHeader title="โปรไฟล์และตั้งค่า" :sub="`${session.name} (${session.id})`" />
    <div class="card">
      <div class="bold" style="margin-bottom:10px">ข้อมูลสาขา (แสดงบนใบปะหน้า)</div>
      <label class="field"><span>ชื่อสาขา</span><input v-model="f.branch" /></label>
      <label class="field"><span>เบอร์สาขา</span><input v-model="f.branchPhone" inputmode="tel" /></label>
      <label class="field"><span>ที่อยู่</span><textarea v-model="f.address" rows="2" /></label>
      <div class="grid2">
        <label class="field"><span>จังหวัด</span><select v-model="f.province"><option v-for="p in PROVINCES" :key="p">{{ p }}</option></select></label>
        <label class="field"><span>รหัสไปรษณีย์</span><input v-model="f.postcode" inputmode="numeric" maxlength="5" /></label>
      </div>
      <button class="btn block" @click="save">บันทึก</button>
    </div>
    <div class="card">
      <div class="bold" style="margin-bottom:10px">เครื่องพิมพ์ใบปะหน้า</div>
      <label class="field"><span>ชื่อเครื่องพิมพ์</span><input :value="session.printerName" placeholder="เช่น Xprinter XP-420B" @change="pref({ printerName: $event.target.value })" /></label>
      <div class="muted" style="margin-bottom:6px">ขนาดกระดาษ</div>
      <div class="chip-row" style="margin-bottom:12px">
        <button class="chip" :class="{ on: session.paper === '100' }" @click="pref({ paper: '100' })">100 × 150 มม.</button>
        <button class="chip" :class="{ on: session.paper === '80' }" @click="pref({ paper: '80' })">80 มม.</button>
      </div>
      <label class="tgrow"><span>พิมพ์ใบปะหน้าอัตโนมัติหลังรับพัสดุ</span><input type="checkbox" :checked="session.autoPrint" @change="pref({ autoPrint: $event.target.checked })" /></label>
      <button class="btn ghost block" style="margin-top:12px" @click="testOpen = true">ทดสอบพิมพ์</button>
      <p class="muted" style="margin-top:8px">ตอนนี้พิมพ์ผ่านระบบพิมพ์ของ Android การเชื่อมเครื่องพิมพ์ความร้อนบลูทูธโดยตรงจะทำในขั้นถัดไป</p>
    </div>
    <div class="card">
      <div class="bold" style="margin-bottom:10px">ค่าเริ่มต้นตอนรับพัสดุ</div>
      <div class="muted" style="margin-bottom:6px">บริการ</div>
      <div class="chip-row" style="margin-bottom:12px"><button v-for="v in SERVICES" :key="v.id" class="chip" :class="{ on: session.defaultService === v.id }" @click="pref({ defaultService: v.id })">{{ v.name }}</button></div>
      <div class="muted" style="margin-bottom:6px">วิธีรับเงิน</div>
      <div class="chip-row"><button v-for="p in PAYMENTS" :key="p.id" class="chip" :class="{ on: session.defaultPayment === p.id }" @click="pref({ defaultPayment: p.id })">{{ p.label }}</button></div>
    </div>
    <div class="card">
      <p class="muted" style="margin:10px 0">แอปใช้ข้อมูลจำลองเก็บในเครื่อง ยังไม่ได้เชื่อมระบบ Senddee จริง</p>
      <button class="btn danger block" @click="reset">รีเซ็ตข้อมูลทดลอง</button>
    </div>
    <button class="btn ghost block" @click="logout">ออกจากระบบ</button>
    <BottomSheet :open="testOpen" title="ทดสอบพิมพ์" @close="testOpen = false">
      <LabelPreview :order="sample" />
      <template #footer><button class="btn block" @click="print">🖨️ พิมพ์</button></template>
    </BottomSheet>
    <p class="muted" style="text-align:center;margin-top:16px">Senddee Staff v0.3.0</p>
  </div>
</template>

<style scoped>
.tgrow { display: flex; justify-content: space-between; align-items: center; gap: 12px; } .tgrow input { width: 22px; height: 22px; accent-color: var(--primary); }
</style>
