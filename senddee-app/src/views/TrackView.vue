<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import Timeline from '../components/Timeline.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { getOrder } from '../api'

const no = ref('')
const result = ref(null)
const searched = ref(false)
const busy = ref(false)
const router = useRouter()

async function search() {
  if (!no.value.trim()) return
  busy.value = true
  result.value = await getOrder(no.value.trim().toUpperCase())
  searched.value = true
  busy.value = false
}
</script>

<template>
  <div class="page">
    <AppHeader title="ติดตามพัสดุ" sub="กรอกเลขพัสดุเพื่อตรวจสอบสถานะ" />
    <label class="field"><span>เลขพัสดุ</span>
      <input v-model="no" placeholder="เช่น SD240001001TH" autocapitalize="characters" @keyup.enter="search" />
    </label>
    <button class="btn block" :disabled="busy" @click="search">{{ busy ? 'กำลังค้นหา…' : 'ค้นหา' }}</button>

    <div v-if="result" class="card res">
      <div class="row between"><b>{{ result.trackingNo }}</b><StatusBadge :status="result.status" /></div>
      <p class="muted" style="margin:6px 0 14px">ถึง {{ result.receiver.name }} · {{ result.receiver.province }}</p>
      <Timeline :events="result.events" />
      <button class="btn soft block" @click="router.push(`/orders/${result.id}`)">ดูรายละเอียดออเดอร์</button>
    </div>
    <p v-else-if="searched" class="muted" style="text-align:center;margin-top:30px">ไม่พบเลขพัสดุนี้</p>
    <p v-else class="muted" style="margin-top:14px">ลองใช้เลขตัวอย่าง: SD240001002TH</p>
  </div>
</template>

<style scoped>.res { margin-top: 16px; }</style>
