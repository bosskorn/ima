<script setup>
import { ref, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { findSender } from '../api'
import { baht, fmtDT } from '../utils/format'

const phone = ref(''); const s = ref(null); const searched = ref(false)
watch(phone, async (p) => {
  searched.value = false; s.value = null
  if (/^0\d{9}$/.test(p)) { s.value = await findSender(p); searched.value = true }
})
</script>

<template>
  <div class="page">
    <AppHeader back title="เช็คเครดิตลูกค้า" sub="ดูยอดเครดิตคงเหลือของผู้ส่ง (ดูได้อย่างเดียว)" />
    <div class="card">
      <label class="field"><span>เบอร์โทรผู้ส่ง</span><input v-model="phone" inputmode="tel" maxlength="10" placeholder="08xxxxxxxx" /></label>
    </div>
    <div v-if="s" class="card res">
      <div class="nm">{{ s.name }}</div><div class="muted">{{ s.phone }}</div>
      <div class="cr">{{ baht(s.credit || 0) }}</div><div class="muted">เครดิตคงเหลือ · ใช้ล่าสุด {{ fmtDT(s.lastAt) }}</div>
    </div>
    <p v-else-if="searched" class="muted" style="text-align:center;margin-top:24px">ไม่พบผู้ส่งเบอร์นี้ในระบบ</p>
    <p class="muted" style="margin-top:16px;line-height:1.6">การเติมเครดิตทำกับแฟรนไชส์โดยตรง ไม่ผ่านแอปนี้ ระบบจะหักค่าขนส่งและค่าเก็บเงินปลายทางจากเครดิตของผู้ส่งตอนสร้างออเดอร์</p>
  </div>
</template>

<style scoped>.res { text-align: center; padding: 20px; } .nm { font-size: 18px; font-weight: 500; } .cr { font-size: 38px; color: var(--primary); margin-top: 10px; }</style>
