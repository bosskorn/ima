# Senddee Android App (Vue 3 + Capacitor)

แอปสร้างออเดอร์/ส่งพัสดุสำหรับสาขา Senddee — ตอนนี้ใช้ข้อมูลจำลอง (mock) ใน `src/api/index.js`
เมื่อมี backend จริง แก้เฉพาะไฟล์นั้นให้เรียก `fetch()` แทน

## รันบนเบราว์เซอร์
    npm install && npm run dev

## สร้าง APK
- ในเครื่องที่มี Android Studio/SDK: `npm run android:apk` → `android/app/build/outputs/apk/debug/app-debug.apk`
- หรือรัน GitHub Action "Senddee Android APK" (Actions → Run workflow) แล้วโหลด artifact `senddee-debug-apk`

สี/แบรนด์แก้ที่ตัวแปร CSS ใน `src/style.css`, ไอคอนแอปแก้ใน `android/app/src/main/res/`
