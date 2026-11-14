<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import LabelPreview from '../components/LabelPreview.vue'
import { useOrders } from '../stores/orders'
import { baht } from '../utils/format'
import { PAYMENTS } from '../data/constants'

const props = defineProps({ id: String })
const orders = useOrders(); const router = useRouter()
onMounted(() => orders.load())
const o = computed(() => orders.byId(props.id))
const print = () => window.print()
const pay = computed(() => PAYMENTS.find((p) => p.id === o.value?.payment.method)?.label)
</script>

<template>
  <div v-if="o" class="page">
    <div class="ok"><div class="tick">✓</div><h1>รับพัสดุเรียบร้อย</h1><p>เก็บเงิน {{ baht(o.payment.amount) }} ({{ pay }}) · ติดใบปะหน้าแล้วนำไปวางที่จุดรอส่งมอบ</p></div>
    <LabelPreview :order="o" />
    <div class="stack" style="margin-top:16px">
      <button class="btn block ghost" @click="print">🖨️ พิมพ์ใบปะหน้า</button>
      <button class="btn block accent" @click="router.replace('/receive')">รับชิ้นต่อไป</button>
      <button class="btn block soft" @click="router.replace('/shop')">ไปหน้าพัสดุในร้าน</button>
    </div>
    <p class="muted" style="text-align:center;margin-top:12px">การพิมพ์ผ่านเครื่องพิมพ์ความร้อนบลูทูธจะเชื่อมต่อในขั้นถัดไป</p>
  </div>
</template>

<style scoped>
.ok { text-align: center; padding: calc(24px + var(--safe-top)) 0 18px; }
.tick { width: 60px; height: 60px; border-radius: 50%; background: #16a34a; color: #fff; font-size: 34px; display: grid; place-items: center; margin: 0 auto 10px; }
h1 { font-size: 20px; } .ok p { color: var(--muted); font-size: 13px; margin-top: 4px; }
</style>
