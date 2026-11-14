<script setup>
import { reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useProfile } from '../stores/profile'
import { useOrders } from '../stores/orders'
import { PROVINCES } from '../data/provinces'

const profile = useProfile()
const orders = useOrders()
const form = reactive({ branch: profile.branch, name: profile.name, phone: profile.phone, address: profile.address, province: profile.province, postcode: profile.postcode })
const toast = ref('')
function say(t) { toast.value = t; setTimeout(() => (toast.value = ''), 2000) }
function save() { profile.save({ ...form }); say('บันทึกแล้ว') }
async function reset() { if (confirm('ล้างข้อมูลทดลองและกลับไปใช้ข้อมูลตัวอย่าง?')) { await orders.reset(); say('รีเซ็ตข้อมูลแล้ว') } }
</script>

<template>
  <div class="page">
    <AppHeader title="บัญชีและสาขา" sub="ข้อมูลผู้ส่งเริ่มต้นสำหรับออเดอร์ใหม่" />
    <div class="card">
      <label class="field"><span>ชื่อสาขา</span><input v-model="form.branch" /></label>
      <label class="field"><span>ชื่อผู้ส่ง / ร้าน</span><input v-model="form.name" /></label>
      <label class="field"><span>เบอร์โทร</span><input v-model="form.phone" inputmode="tel" maxlength="10" /></label>
      <label class="field"><span>ที่อยู่</span><textarea v-model="form.address" rows="2" /></label>
      <div class="grid2">
        <label class="field"><span>จังหวัด</span><select v-model="form.province"><option v-for="p in PROVINCES" :key="p">{{ p }}</option></select></label>
        <label class="field"><span>รหัสไปรษณีย์</span><input v-model="form.postcode" inputmode="numeric" maxlength="5" /></label>
      </div>
      <button class="btn block" @click="save">บันทึก</button>
    </div>
    <div class="card">
      <p class="muted" style="margin-bottom:10px">ขณะนี้แอปใช้ข้อมูลจำลอง (mock) เก็บในเครื่องเท่านั้น ยังไม่ได้เชื่อมต่อระบบ Senddee จริง</p>
      <button class="btn danger block" @click="reset">รีเซ็ตข้อมูลทดลอง</button>
    </div>
    <p class="muted" style="text-align:center;margin-top:16px">Senddee v0.1.0</p>
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>
