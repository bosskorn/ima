<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import ReceiptDoc from '../components/ReceiptDoc.vue'
import { getTx } from '../api'
import { useOrders } from '../stores/orders'
import { useReceive } from '../stores/receive'
import { printVisible } from '../utils/print'

const props = defineProps({ id: String })
const router = useRouter(); const orders = useOrders(); const rc = useReceive()
const tx = ref(null)

onMounted(async () => {
  await orders.load()
  tx.value = await getTx(props.id)
  if (rc.txId === props.id) rc.reset() // this customer visit is finished
})
const items = computed(() => (tx.value ? tx.value.orderIds.map((id) => orders.list.find((o) => o.id === id)).filter(Boolean) : []))
const count = computed(() => items.value.filter((o) => o.status !== 'cancelled').length)
</script>

<template>
  <div v-if="tx" class="page">
    <AppHeader back title="ใบเสร็จ" :sub="tx.id" />
    <div class="done"><div class="tick">✓</div><div>สร้างออเดอร์ {{ count }} ชิ้นเรียบร้อย</div><small class="muted">หักค่าบริการจากเครดิตผู้ส่งแล้ว</small></div>

    <ReceiptDoc :tx="tx" :items="items" />

    <div class="stack" style="margin-top:14px">
      <button class="btn block" @click="printVisible">🖨️ พิมพ์ใบเสร็จ</button>
      <button class="btn block ghost" @click="router.replace('/receive')">รับลูกค้าคนถัดไป</button>
      <button class="btn block soft" @click="router.replace('/')">กลับหน้าหลัก</button>
    </div>
  </div>
  <div v-else class="page"><AppHeader back title="ไม่พบใบเสร็จ" /></div>
</template>

<style scoped>
.done { text-align: center; padding: 8px 0 12px; } .tick { width: 52px; height: 52px; border-radius: 50%; background: #16a34a; color: #fff; font-size: 30px; display: grid; place-items: center; margin: 0 auto 8px; }
</style>
