<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import OrderCard from '../components/OrderCard.vue'
import { useOrders } from '../stores/orders'
import { scanBarcode, canCameraScan } from '../utils/scanner'
import { toast } from '../utils/toast'
import { STATUS } from '../data/constants'

const orders = useOrders()
onMounted(() => orders.load())
const route = useRoute()
const q = ref('')
const filter = ref(STATUS[route.query.filter] ? route.query.filter : 'all')
const labelMode = !!route.query.label
const filters = [{ id: 'all', label: 'ทั้งหมด' }, ...['received', 'handed_over', 'in_transit', 'delivered', 'cancelled'].map((id) => ({ id, label: STATUS[id].short }))]
const shown = computed(() => {
  const t = q.value.trim().toLowerCase()
  return orders.list.filter((o) => (filter.value === 'all' || o.status === filter.value)
    && (!t || o.trackingNo.toLowerCase().includes(t) || o.receiver.name.toLowerCase().includes(t) || o.receiver.phone.includes(t) || (o.sender?.phone || '').includes(t)))
})
async function cam() {
  try { const v = await scanBarcode(); if (v) q.value = v; else if (!canCameraScan()) toast('สแกนกล้องใช้ได้ในแอปมือถือ') } catch (e) { toast(e.message) }
}
</script>

<template>
  <div class="page">
    <header class="hdr"><h1>ค้นหาพัสดุ</h1><p>เลขพัสดุ · ชื่อ · เบอร์ผู้รับ/ผู้ส่ง</p></header>
    <div class="row" style="margin-bottom:10px">
      <input v-model="q" class="in" type="search" placeholder="สแกนหรือพิมพ์เพื่อค้นหา" />
      <button class="icon-btn" style="height:46px" @click="cam" aria-label="สแกน">📷</button>
    </div>
    <p v-if="labelMode" class="muted" style="margin-bottom:8px">แตะพัสดุที่ต้องการ แล้วกด “ใบปะหน้า” เพื่อพิมพ์ซ้ำ</p>
    <div class="chips"><button v-for="f in filters" :key="f.id" class="chip" :class="{ on: filter === f.id }" @click="filter = f.id">{{ f.label }}</button></div>
    <OrderCard v-for="o in shown" :key="o.id" :order="o" />
    <p v-if="!shown.length" class="muted" style="text-align:center;margin-top:40px">ไม่พบพัสดุ</p>
  </div>
</template>

<style scoped>
.hdr { background: var(--primary); color: #fff; padding: calc(14px + var(--safe-top)) 16px 18px; margin: 0 -16px 14px; border-radius: 0 0 22px 22px; }
h1 { font-size: 19px; } .hdr p { font-size: 13px; opacity: .85; margin-top: 2px; }
.in { flex: 1; min-width: 0; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 8px; background: #fff; outline: none; }
.chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; } .chip { white-space: nowrap; padding: 6px 14px; font-size: 13px; }
</style>
