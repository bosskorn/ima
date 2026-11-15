<script setup>
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { NEWS, isRead, markRead } from '../utils/news'
const open = ref('')
const fmt = (d) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
function toggle(id) { open.value = open.value === id ? '' : id; markRead(id) }
</script>

<template>
  <div class="page">
    <AppHeader back title="ข่าวสาร" sub="ประกาศจากสำนักงานใหญ่ SendDee" />
    <button v-for="n in NEWS" :key="n.id" class="card nw" @click="toggle(n.id)">
      <div class="row between"><span class="t"><i v-if="!isRead(n.id)" class="dot" />{{ n.title }}</span><small class="muted">{{ fmt(n.date) }}</small></div>
      <p v-if="open === n.id" class="body">{{ n.body }}</p>
    </button>
  </div>
</template>

<style scoped>
.nw { width: 100%; text-align: left; font: inherit; color: inherit; display: block; margin-top: 10px; }
.t { display: flex; align-items: center; gap: 8px; } .dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; flex: none; }
.body { margin-top: 10px; color: var(--muted); line-height: 1.6; }
</style>
