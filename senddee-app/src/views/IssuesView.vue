<script setup>
import { onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { listIssues, createIssue, resolveIssue } from '../api'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { toast } from '../utils/toast'
import { fmtDT } from '../utils/format'

const orders = useOrders(); const session = useSession()
const TYPES = ['พัสดุชำรุด/เสียหาย', 'ที่อยู่ผิด/ติดต่อผู้รับไม่ได้', 'ลูกค้าโต้แย้งค่าบริการ', 'น้ำหนักไม่ตรง', 'สินค้าต้องห้าม/ไม่แน่ใจ', 'อื่น ๆ']
const list = ref([]); const no = ref(''); const type = ref(''); const note = ref(''); const busy = ref(false)
onMounted(async () => { orders.load(); list.value = await listIssues() })

async function resolve(id) { list.value = await resolveIssue(id); toast('ปิดเรื่องแล้ว') }
async function submit() {
  if (!type.value) return toast('เลือกประเภทปัญหา')
  if (no.value && !orders.list.some((o) => o.trackingNo === no.value.trim().toUpperCase())) return toast('ไม่พบเลขพัสดุนี้')
  busy.value = true
  await createIssue({ trackingNo: no.value.trim().toUpperCase(), type: type.value, note: note.value.trim() }, session)
  list.value = await listIssues(); no.value = ''; type.value = ''; note.value = ''; busy.value = false
  toast('ส่งเรื่องให้สำนักงานใหญ่แล้ว')
}
</script>

<template>
  <div class="page">
    <AppHeader back title="แจ้งปัญหา" sub="รายงานเหตุผิดปกติที่หน้าร้าน" />
    <div class="card">
      <label class="field"><span>เลขพัสดุ (ถ้าเกี่ยวกับพัสดุชิ้นใด)</span><input v-model="no" list="nos" autocapitalize="characters" placeholder="SD…" /></label>
      <datalist id="nos"><option v-for="o in orders.list.slice(0, 20)" :key="o.id" :value="o.trackingNo" /></datalist>
      <div class="muted" style="margin-bottom:6px">ประเภทปัญหา</div>
      <div class="chip-row" style="margin-bottom:12px"><button v-for="t in TYPES" :key="t" class="chip" :class="{ on: type === t }" @click="type = t">{{ t }}</button></div>
      <label class="field"><span>รายละเอียด</span><textarea v-model="note" rows="3" /></label>
      <button class="btn block" :disabled="busy" @click="submit">ส่งเรื่อง</button>
    </div>
    <h2 class="section-title">ประวัติการแจ้ง</h2>
    <div v-for="i in list" :key="i.id" class="card" style="margin-top:8px">
      <div class="row between"><span>{{ i.type }}</span><span class="badge" :class="i.status === 'resolved' ? 'green' : 'amber'">{{ i.status === 'resolved' ? 'แก้ไขแล้ว' : 'รอดำเนินการ' }}</span></div>
      <div class="muted">{{ i.trackingNo || 'ไม่ระบุพัสดุ' }} · {{ i.by }} · {{ fmtDT(i.at) }}</div>
      <p v-if="i.note" style="margin-top:6px">{{ i.note }}</p>
      <button v-if="i.status !== 'resolved'" class="btn soft sm" style="margin-top:8px" @click="resolve(i.id)">ปิดเรื่อง</button>
    </div>
    <p v-if="!list.length" class="muted" style="text-align:center;margin-top:20px">ยังไม่มีการแจ้งปัญหา</p>
  </div>
</template>
