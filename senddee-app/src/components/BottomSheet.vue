<script setup>
defineProps({ open: Boolean, title: String })
defineEmits(['close'])
</script>
<template>
  <Teleport to="body">
    <div v-if="open" class="scrim" @click.self="$emit('close')">
      <div class="sheet">
        <div class="grab" />
        <div class="row between head"><h3>{{ title }}</h3><button class="x" @click="$emit('close')" aria-label="ปิด">✕</button></div>
        <div class="body"><slot /></div>
        <div v-if="$slots.footer" class="foot"><slot name="footer" /></div>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.scrim { position: fixed; inset: 0; background: rgba(15,23,42,.5); z-index: 40; display: flex; align-items: flex-end; justify-content: center; }
.sheet { background: #fff; width: 100%; max-width: 560px; max-height: 88vh; border-radius: 8px 22px 0 0; display: flex; flex-direction: column;
  padding-bottom: var(--safe-bottom); animation: up .2s ease-out; }
@keyframes up { from { transform: translateY(30px); opacity: 0 } }
.grab { width: 40px; height: 4px; background: var(--line); border-radius: 4px; margin: 8px auto 0; }
.head { padding: 10px 16px 6px; } h3 { font-size: 17px; }
.x { border: 0; background: var(--bg); width: 32px; height: 32px; border-radius: 50%; }
.body { padding: 6px 16px 12px; overflow-y: auto; }
.foot { padding: 10px 16px 14px; border-top: 1px solid var(--line); display: flex; gap: 10px; }
</style>
