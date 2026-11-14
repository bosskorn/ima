<script setup>
import { useRouter } from 'vue-router'
defineProps({ title: String, back: Boolean, sub: String })
const router = useRouter()
const goBack = () => (window.history.length > 1 ? router.back() : router.push('/'))
</script>

<template>
  <header class="hdr">
    <button v-if="back" class="back" @click="goBack" aria-label="ย้อนกลับ">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <div class="t">
      <h1>{{ title }}</h1>
      <p v-if="sub">{{ sub }}</p>
    </div>
    <slot />
  </header>
</template>

<style scoped>
.hdr { background: var(--primary); color: #fff; padding: calc(14px + var(--safe-top)) 16px 18px; margin: 0 -16px 16px;
  display: flex; align-items: center; gap: 10px; border-radius: 0 0 22px 22px; }
.t { flex: 1; min-width: 0; }
h1 { font-size: 19px; font-weight: 700; }
p { font-size: 13px; opacity: .85; margin-top: 2px; }
.back { background: rgba(255,255,255,.18); border: 0; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; }
</style>
