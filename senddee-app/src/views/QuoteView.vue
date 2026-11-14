<script setup>
import { ref, computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { calcFee } from '../api'
import { CARRIERS, COD_RATE } from '../data/constants'
import { baht } from '../utils/format'

const w = ref(''); const cod = ref('')
const valid = computed(() => Number(w.value) > 0)
const rows = computed(() => CARRIERS.map((c) => ({ ...c, ...calcFee({ weight: w.value, carrier: c.id, cod: Number(cod.value) || 0 }) })))
</script>

<template>
  <div class="page">
    <AppHeader back title="เช็คราคา" sub="ตอบลูกค้าที่ถามราคาหน้าร้าน" />
    <div class="card">
      <label class="field"><span>น้ำหนัก (กก.)</span><input v-model="w" inputmode="decimal" placeholder="0.0" /></label>
      <label class="field"><span>ยอด COD (ถ้ามี)</span><input v-model="cod" inputmode="numeric" placeholder="0" /></label>
      <div class="chip-row"><button v-for="n in [0.5, 1, 2, 3, 5, 10, 20]" :key="n" class="chip" :class="{ on: Number(w) === n }" @click="w = String(n)">{{ n }} กก.</button></div>
    </div>
    <div v-if="valid" class="card">
      <div v-for="r in rows" :key="r.id" class="rw">
        <img :src="r.logo" :alt="r.name" />
        <div class="grow"><div>{{ r.name }}</div><small class="muted">เริ่มต้น {{ baht(r.start) }}<span v-if="r.codFee"> · ค่า COD {{ COD_RATE * 100 }}% = {{ baht(r.codFee) }}</span></small></div>
        <div class="pr">{{ baht(r.total) }}</div>
      </div>
      <RouterLink class="btn block" style="margin-top:12px;text-decoration:none" to="/receive">ไปรับพัสดุ</RouterLink>
    </div>
    <p v-else class="muted" style="text-align:center;margin-top:24px">กรอกน้ำหนักเพื่อดูราคา</p>
  </div>
</template>

<style scoped>
.rw { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); } .rw:last-of-type { border: 0; }
.rw img { width: 60px; height: 28px; object-fit: contain; } .grow { flex: 1; } .pr { font-size: 22px; color: var(--primary); }
</style>
