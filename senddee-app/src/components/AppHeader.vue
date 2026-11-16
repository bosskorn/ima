<script setup>
import { useRouter } from 'vue-router'
defineProps({ title: String, back: Boolean, sub: String })
const router = useRouter()
const goBack = () => (window.history.length > 1 ? router.back() : router.push('/'))
</script>

<template>
  <header class="hdr">
    <button v-if="back" class="back" @click="goBack" aria-label="ย้อนกลับ">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <div class="t">
      <h1>{{ title }}</h1>
      <p v-if="sub">{{ sub }}</p>
    </div>
    <slot />
  </header>
</template>

<style scoped>
.hdr { position: sticky; top: 0; z-index: 15; background: var(--primary); color: #fff; padding: calc(10px + var(--safe-top)) 12px 10px 16px; margin: 0 -16px 12px; display: flex; align-items: center; gap: 8px; min-height: 56px; }
.back { margin-left: -8px; background: transparent; border: 0; width: 36px; height: 36px; display: grid; place-items: center; }
.t { flex: 1; min-width: 0; }
h1 { font-family: var(--font-head); font-size: 18px; line-height: 1.2; font-weight: 500; }
p { font-size: 12px; opacity: .85; }
</style>
