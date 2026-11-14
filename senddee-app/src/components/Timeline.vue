<script setup>
import { STATUS } from '../data/constants'
defineProps({ events: Array })
const fmt = (iso) => new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <ol class="tl">
    <li v-for="(e, i) in [...events].reverse()" :key="e.at + e.status" :class="{ first: i === 0 }">
      <i class="dot" :class="STATUS[e.status]?.color" />
      <div>
        <div class="bold">{{ STATUS[e.status]?.label }}</div>
        <div class="muted">{{ e.text }}</div>
        <div class="muted small">{{ fmt(e.at) }}</div>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.tl { list-style: none; margin: 0; padding: 0 0 0 4px; }
.tl li { display: flex; gap: 14px; position: relative; padding-bottom: 18px; }
.tl li:not(:last-child)::before { content: ''; position: absolute; left: 6px; top: 16px; bottom: 0; width: 2px; background: var(--line); }
.dot { width: 14px; height: 14px; border-radius: 50%; background: #cbd5e1; margin-top: 4px; flex: none; }
.first .dot { box-shadow: 0 0 0 4px var(--primary-soft); background: var(--primary); }
.dot.red { background: var(--danger); }
.small { font-size: 12px; margin-top: 2px; }
</style>
