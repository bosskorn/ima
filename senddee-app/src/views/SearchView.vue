<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
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
const labelMode = computed(() => !!route.query.label)
const voidMode = computed(() => !!route.query.void)
watch(() => route.fullPath, () => { if (route.path === '/search') { filter.value = STATUS[route.query.filter] ? route.query.filter : 'all'; q.value = '' } })
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
    <AppHeader title="ค้นหาพัสดุ" sub="เลขพัสดุ · ชื่อ · เบอร์ผู้รับ/ผู้ส่ง" />
    <div class="row" style="margin-bottom:10px">
      <input v-model="q" class="in" type="search" placeholder="สแกนหรือพิมพ์เพื่อค้นหา" />
      <button class="icon-btn" style="height:46px" @click="cam" aria-label="สแกน">📷</button>
    </div>
    <p v-if="labelMode" class="muted" style="margin-bottom:8px">แตะพัสดุที่ต้องการ แล้วกด “ใบปะหน้า” เพื่อพิมพ์ซ้ำ</p>
    <p v-if="voidMode" class="muted" style="margin-bottom:8px">แตะพัสดุที่ต้องการยกเลิก (ยกเลิกได้เฉพาะที่ยังไม่ส่งมอบขนส่ง)</p>
    <div class="chips"><button v-for="f in filters" :key="f.id" class="chip" :class="{ on: filter === f.id }" @click="filter = f.id">{{ f.label }}</button></div>
    <OrderCard v-for="o in shown" :key="o.id" :order="o" />
    <p v-if="!shown.length" class="muted" style="text-align:center;margin-top:40px">ไม่พบพัสดุ</p>
  </div>
</template>

<style scoped>
.in { flex: 1; min-width: 0; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 8px; background: #fff; outline: none; }
.chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; } .chip { white-space: nowrap; padding: 6px 14px; font-size: 13px; }
</style>
