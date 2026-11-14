<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '../stores/session'

const session = useSession()
const router = useRouter()
const code = ref('S001')
const pin = ref('')
const err = ref('')
function go() {
  if (!code.value.trim()) return (err.value = 'กรอกรหัสพนักงาน')
  if (!/^\d{4,6}$/.test(pin.value)) return (err.value = 'PIN ต้องเป็นตัวเลข 4–6 หลัก')
  session.login(code.value.trim().toUpperCase(), code.value.trim().toUpperCase() === 'S001' ? 'น้องฟ้า' : '')
  router.replace('/')
}
</script>

<template>
  <div class="login">
    <div class="brand"><div class="logo">S</div><h1>Senddee</h1><p>แอปพนักงานหน้าร้าน · {{ session.branch }}</p></div>
    <div class="card">
      <label class="field"><span>รหัสพนักงาน</span><input v-model="code" autocapitalize="characters" /></label>
      <label class="field"><span>PIN</span><input v-model="pin" type="password" inputmode="numeric" maxlength="6" @keyup.enter="go" /></label>
      <p v-if="err" class="err">{{ err }}</p>
      <button class="btn block" @click="go">เข้าสู่ระบบ</button>
      <p class="muted hint">โหมดทดลอง: ใส่ PIN เป็นตัวเลขอะไรก็ได้ 4 หลัก</p>
    </div>
  </div>
</template>

<style scoped>
.login { min-height: 100vh; background: var(--primary); padding: calc(60px + var(--safe-top)) 20px 20px; }
.brand { text-align: center; color: #fff; margin-bottom: 28px; }
.logo { width: 68px; height: 68px; border-radius: 20px; background: var(--accent); margin: 0 auto 12px; display: grid; place-items: center; font-size: 34px; font-weight: 800; }
h1 { font-size: 28px; } .brand p { opacity: .85; margin-top: 4px; }
.err { color: var(--danger); font-size: 13px; margin-bottom: 10px; } .hint { text-align: center; margin-top: 12px; }
</style>
