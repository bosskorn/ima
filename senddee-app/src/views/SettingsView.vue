<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { useSession } from '../stores/session'
import { useOrders } from '../stores/orders'
import { toast } from '../utils/toast'
import { PROVINCES } from '../data/provinces'

const session = useSession(); const orders = useOrders(); const router = useRouter()
const f = reactive({ branch: session.branch, branchPhone: session.branchPhone, address: session.address, province: session.province, postcode: session.postcode })
function save() { session.saveBranch({ ...f }); toast('บันทึกแล้ว') }
function logout() { if (confirm('ออกจากระบบ?')) { session.logout(); router.replace('/login') } }
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
      <div class="kv"><span>เครื่องพิมพ์ใบปะหน้า</span><span class="muted">ยังไม่ได้เชื่อมต่อ (เร็ว ๆ นี้)</span></div>
      <p class="muted" style="margin:10px 0">แอปใช้ข้อมูลจำลองเก็บในเครื่อง ยังไม่ได้เชื่อมระบบ Senddee จริง</p>
      <button class="btn danger block" @click="reset">รีเซ็ตข้อมูลทดลอง</button>
    </div>
    <button class="btn ghost block" @click="logout">ออกจากระบบ</button>
    <p class="muted" style="text-align:center;margin-top:16px">Senddee Staff v0.2.0</p>
  </div>
</template>
