<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '../stores/session'
import BrandLogo from '../components/BrandLogo.vue'
import { APP_VERSION, BRANCHES, DEMO_STAFF, DEMO_PIN, SUPPORT_PHONE } from '../data/constants'

const session = useSession(); const router = useRouter()
const KEY = 'senddee.login.last'
let last = {}; try { last = JSON.parse(localStorage.getItem(KEY) || '{}') } catch {}
const branchCode = ref(last.branchCode || ''); const empId = ref(last.empId || ''); const pin = ref('')
const remember = ref(last.remember ?? true); const show = ref(false); const err = ref(''); const busy = ref(false)
const fails = ref(0); const lockLeft = ref(0); let timer
const locked = computed(() => lockLeft.value > 0)

function lock(sec) { lockLeft.value = sec; clearInterval(timer); timer = setInterval(() => { if (--lockLeft.value <= 0) { clearInterval(timer); fails.value = 0; err.value = '' } }, 1000) }
onBeforeUnmount(() => clearInterval(timer))

async function go() {
  if (locked.value || busy.value) return
  err.value = ''
  const bc = branchCode.value.trim().toUpperCase(), id = empId.value.trim().toUpperCase()
  if (!bc || !id || !pin.value) return (err.value = 'กรอกรหัสสาขา รหัสพนักงาน และ PIN ให้ครบ')
  if (!/^\d{4,6}$/.test(pin.value)) return (err.value = 'PIN ต้องเป็นตัวเลข 4–6 หลัก')
  busy.value = true; await new Promise((r) => setTimeout(r, 450)) // MOCK network round-trip
  const branch = BRANCHES[bc], name = DEMO_STAFF[id]
  if (!branch) { busy.value = false; return (err.value = 'ไม่พบรหัสสาขานี้') }
  if (!name || pin.value !== DEMO_PIN) {
    busy.value = false; fails.value++
    if (fails.value >= 5) { lock(30); return (err.value = 'กรอกผิดหลายครั้ง กรุณารอ 30 วินาที') }
    return (err.value = `รหัสพนักงานหรือ PIN ไม่ถูกต้อง (เหลืออีก ${5 - fails.value} ครั้ง)`)
  }
  try { localStorage.setItem(KEY, JSON.stringify(remember.value ? { branchCode: bc, empId: id, remember: true } : { remember: false })) } catch {}
  session.login({ id, name, branchCode: bc, branch })
  router.replace('/')
}
</script>

<template>
  <div class="login">
    <div class="brand">
      <BrandLogo variant="white" :size="76" class="lg" />
      <h1>Send<span>Dee</span></h1>
      <p>แอปสำหรับพนักงานแฟรนไชส์</p>
    </div>

    <form class="card" @submit.prevent="go" autocomplete="off">
      <label class="field"><span>รหัสสาขา</span><input v-model="branchCode" autocapitalize="characters" placeholder="เช่น LP001" /></label>
      <label class="field"><span>รหัสพนักงาน</span><input v-model="empId" autocapitalize="characters" placeholder="เช่น S001" /></label>
      <label class="field"><span>PIN</span>
        <div class="pw"><input v-model="pin" :type="show ? 'text' : 'password'" inputmode="numeric" maxlength="6" placeholder="ตัวเลข 4–6 หลัก" />
          <button type="button" class="eye" :aria-label="show ? 'ซ่อน PIN' : 'แสดง PIN'" @click="show = !show">{{ show ? 'ซ่อน' : 'แสดง' }}</button></div>
      </label>
      <label class="rem"><input v-model="remember" type="checkbox" /><span>จดจำรหัสสาขาและรหัสพนักงาน</span></label>
      <p v-if="err" class="err" role="alert">{{ err }}<span v-if="locked"> ({{ lockLeft }})</span></p>
      <button class="btn block" type="submit" :disabled="busy || locked">{{ busy ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ' }}</button>
      <p class="help">ลืม PIN? ติดต่อผู้ดูแลสาขา หรือสำนักงานใหญ่ <a :href="`tel:${SUPPORT_PHONE}`">{{ SUPPORT_PHONE }}</a></p>
    </form>

    <div class="demo">โหมดทดลอง · สาขา LP001 · พนักงาน S001 · PIN 1234</div>
    <div class="ver">SendDee Staff v{{ APP_VERSION }}</div>
  </div>
</template>

<style scoped>
.login { position: absolute; inset: 0; overflow-y: auto; overscroll-behavior: contain; background: var(--primary); padding: calc(56px + var(--safe-top)) 20px calc(20px + var(--safe-bottom)); display: flex; flex-direction: column; }
.brand { text-align: center; color: #fff; margin-bottom: 26px; }
.lg { margin-bottom: 12px; }
h1 { font-size: 30px; font-weight: 500; } h1 span { color: #7FEEFF; } .brand p { opacity: .85; margin-top: 2px; }
.card { border-radius: 12px; padding: 20px 16px 16px; }
.pw { position: relative; } .pw input { padding-right: 64px; }
.eye { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); border: 0; background: transparent; color: var(--primary); padding: 8px; font-size: 14px; }
.rem { display: flex; align-items: center; gap: 8px; margin: 2px 0 14px; color: var(--muted); font-size: 14px; } .rem input { width: 18px; height: 18px; accent-color: var(--primary); }
.err { background: #fee2e2; color: #991b1b; border-radius: 8px; padding: 10px 12px; font-size: 14px; margin-bottom: 12px; }
.help { text-align: center; color: var(--muted); font-size: 13px; margin-top: 14px; line-height: 1.6; } .help a { color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; min-height: 44px; padding: 0 6px; }
.demo { margin-top: 16px; text-align: center; color: rgba(255,255,255,.8); font-size: 13px; background: rgba(255,255,255,.12); border-radius: 8px; padding: 8px; }
.ver { margin-top: auto; padding-top: 20px; text-align: center; color: rgba(255,255,255,.7); font-size: 12px; }
@media (max-height: 720px) { .login { padding-top: calc(24px + var(--safe-top)); } .brand { margin-bottom: 14px; } .lg :deep(svg) { width: 56px; height: 56px; } h1 { font-size: 26px; } .demo { margin-top: 10px; } }
</style>
