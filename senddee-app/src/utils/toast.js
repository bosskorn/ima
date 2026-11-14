import { ref } from 'vue'
export const toastMsg = ref('')
let t
export function toast(msg, ms = 2200) {
  toastMsg.value = msg
  clearTimeout(t)
  t = setTimeout(() => (toastMsg.value = ''), ms)
}
