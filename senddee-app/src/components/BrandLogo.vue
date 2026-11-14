<script setup>
// SendDee logo: rounded square with an isometric parcel mark (taken from senddee.com), plus the "SendDee" wordmark.
// variants: color (on light bg) · white (on blue bg) · print (black & white, for thermal labels)
import { computed } from 'vue'
let n = 0
const props = defineProps({ variant: { type: String, default: 'color' }, size: { type: Number, default: 36 }, text: Boolean, sub: String })
const gid = `bg${++n}`
const c = computed(() => ({
  color: { bg: `url(#${gid})`, stroke: '#FFFFFF', chev: '#00E5FF', t1: '#0F172A', t2: '#0066FF' },
  white: { bg: '#FFFFFF', stroke: '#0066FF', chev: '#00B8E6', t1: '#FFFFFF', t2: '#7FEEFF' },
  print: { bg: '#000000', stroke: '#FFFFFF', chev: '#FFFFFF', t1: '#000000', t2: '#000000' },
}[props.variant]))
</script>

<template>
  <span class="bl">
    <svg :width="size" :height="size" viewBox="0 0 48 48" aria-label="SendDee">
      <defs><linearGradient :id="gid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0066FF" /><stop offset="1" stop-color="#0044CC" /></linearGradient></defs>
      <rect width="48" height="48" rx="13" :fill="c.bg" />
      <g transform="translate(10 10) scale(1.1667)" fill="none" :stroke="c.stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.91 12.21 21.97 12 21.97C11.79 21.97 11.59 21.91 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.09 11.79 2.03 12 2.03C12.21 2.03 12.41 2.09 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z" />
        <path d="M12 22V12" /><path d="M12 12L20.5 7.5" /><path d="M12 12L3.5 7.5" />
        <path d="M7 10.5L12 13.5L17 10.5" :stroke="c.chev" stroke-width="2.2" />
      </g>
    </svg>
    <span v-if="text" class="wm"><span class="t" :style="{ color: c.t1, fontSize: size * 0.56 + 'px' }">Send<span :style="{ color: c.t2 }">Dee</span></span><small v-if="sub" :style="{ color: c.t1 }">{{ sub }}</small></span>
  </span>
</template>

<style scoped>
.bl { display: inline-flex; align-items: center; gap: 10px; line-height: 1; }
.wm { display: flex; flex-direction: column; gap: 3px; text-align: left; }
.t { font-weight: 500; letter-spacing: -.3px; line-height: 1; } .wm small { font-size: 12px; opacity: .85; line-height: 1.1; }
</style>
