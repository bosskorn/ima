<script setup>
import { onMounted, ref, computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import OrderCard from '../components/OrderCard.vue'
import { useOrders } from '../stores/orders'

const orders = useOrders()
onMounted(() => orders.load())
const q = ref('')
const filter = ref('all')
const filters = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'active', label: 'กำลังจัดส่ง' },
  { id: 'delivered', label: 'สำเร็จ' },
  { id: 'cancelled', label: 'ยกเลิก' },
]
const shown = computed(() => orders.list.filter((o) => {
  if (filter.value === 'active' && ['delivered', 'cancelled'].includes(o.status)) return false
  if (filter.value === 'delivered' && o.status !== 'delivered') return false
  if (filter.value === 'cancelled' && o.status !== 'cancelled') return false
  const t = q.value.trim().toLowerCase()
  return !t || o.trackingNo.toLowerCase().includes(t) || o.receiver.name.toLowerCase().includes(t) || o.receiver.phone.includes(t)
}))
</script>

<template>
  <div class="page">
    <AppHeader title="ออเดอร์ของฉัน" :sub="`${orders.list.length} รายการ`" />
    <label class="field"><input v-model="q" type="search" placeholder="ค้นหาเลขพัสดุ / ชื่อ / เบอร์ผู้รับ" /></label>
    <div class="chips">
      <button v-for="f in filters" :key="f.id" :class="{ on: filter === f.id }" @click="filter = f.id">{{ f.label }}</button>
    </div>
    <OrderCard v-for="o in shown" :key="o.id" :order="o" />
    <p v-if="!shown.length" class="muted empty">ไม่พบออเดอร์</p>
  </div>
</template>

<style scoped>
.chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.chips button { border: 1.5px solid var(--line); background: #fff; border-radius: 99px; padding: 6px 14px; white-space: nowrap; font-size: 13px; }
.chips button.on { background: var(--primary); color: #fff; border-color: var(--primary); }
.empty { text-align: center; margin-top: 40px; }
</style>
