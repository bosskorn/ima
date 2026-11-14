<script setup>
import { onMounted, ref, computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useOrders } from '../stores/orders'
import { useSession } from '../stores/session'
import { listClosings, closeDay } from '../api'
import { toast } from '../utils/toast'
import { baht, fmtDT } from '../utils/format'

const orders = useOrders(); const session = useSession()
const counted = ref(''); const note = ref(''); const list = ref([]); const busy = ref(false)
onMounted(async () => { orders.load(); list.value = await listClosings() })

// Cash the drawer should hold according to today's counter payments (the only figure staff need to reconcile).
const expected = computed(() => orders.summary.byPay.cash || 0)
const diff = computed(() => (counted.value === '' ? null : Number(counted.value) - expected.value))

async function save() {
  if (counted.value === '') return toast('กรอกยอดเงินสดที่นับได้')
  busy.value = true
  await closeDay({ expected: expected.value, counted: Number(counted.value), note: note.value }, session)
  list.value = await listClosings(); counted.value = ''; note.value = ''; busy.value = false
  toast('บันทึกปิดยอดแล้ว')
}
</script>

<template>
  <div class="page">
    <AppHeader back title="ปิดยอดเงินสด" sub="นับเงินในลิ้นชักก่อนปิดร้าน" />
    <div class="card">
      <div class="kv"><span class="muted">เงินสดตามระบบ (วันนี้)</span><span class="amt">{{ baht(expected) }}</span></div>
      <label class="field" style="margin-top:12px"><span>นับเงินสดในลิ้นชักได้ (บาท)</span><input v-model="counted" inputmode="numeric" /></label>
      <div v-if="diff !== null" class="kv" :style="{ color: diff ? 'var(--danger)' : 'var(--primary)' }"><span>ผลต่าง</span><span>{{ diff === 0 ? 'ยอดตรง' : baht(diff) }}</span></div>
      <label class="field" style="margin-top:12px"><span>หมายเหตุ (ถ้ามี)</span><input v-model="note" /></label>
      <button class="btn block" :disabled="busy" @click="save">บันทึกปิดยอด</button>
    </div>
    <template v-if="list.length">
      <h2 class="section-title">ประวัติการปิดยอด</h2>
      <div v-for="c in list" :key="c.id" class="card" style="margin-top:8px">
        <div class="kv"><span>{{ fmtDT(c.at) }} · {{ c.by }}</span><span :style="{ color: c.diff ? 'var(--danger)' : 'var(--primary)' }">{{ c.diff ? `ผลต่าง ${baht(c.diff)}` : 'ยอดตรง' }}</span></div>
        <div class="muted">ระบบ {{ baht(c.expected) }} · นับได้ {{ baht(c.counted) }}<span v-if="c.note"> · {{ c.note }}</span></div>
      </div>
    </template>
  </div>
</template>

<style scoped>.amt { font-size: 20px; color: var(--primary); }</style>
