# เทมเพลตวิดีโอสไตล์ Hook (Remotion)

คลิปแนวตั้ง 1080×1920 สำหรับ TikTok / Reels / Shorts
- ข้อความ Hook กลางจอ (ขาว/แดง ตัวหนา ขอบดำหนา) เด้งขึ้นทีละบรรทัด
- ข้อความตามเวลา เน้นคำสำคัญด้วยสีแดง/เหลือง
- ฟอนต์ Kanit ExtraBold (SIL OFL, ดู `public/KANIT-OFL-LICENSE.txt`)
- คลิปแนวนอนจะเติมขอบบน-ล่างด้วยภาพเบลออัตโนมัติ

## ไฟล์สำคัญ
| ไฟล์ | หน้าที่ |
|---|---|
| `src/hook/sample.json` | ข้อความ, สี, เวลา (แก้ที่นี่) |
| `src/hook/HookStyle.tsx` | ดีไซน์/อนิเมชัน — สีและฟอนต์อยู่ใน `T` บนสุดไฟล์ |
| `scripts/transcribe.py` | ถอดเสียงไทยพร้อมเวลาด้วย Whisper |
| `.claude/skills/remotion-motion-graphics/` | สกิลโมชันกราฟิก จาก [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) (MIT) |

## สร้างวิดีโออัตโนมัติจากบท (ไม่ต้องมีคลิป, ฟรี)
เขียนบทตาม `scripts/example_script.json` (ประโยคพากย์ `say` + ข้อความบนจอ `lines`) แล้ว:
```bash
pip install edge-tts transformers torch scipy
python3 scripts/make_video.py scripts/example_script.json out/video.mp4
```
ระบบจะสร้างเสียงพากย์ไทย จับเวลาข้อความให้ตรงเสียงพูด แล้วเรนเดอร์ให้เอง
- `"tts": "edge"` เสียง Microsoft Neural ฟรี ไม่ต้องมี key (ต้องต่อเน็ต) · `"tts": "mms"` รันในเครื่อง 100%
- เสียง: `th-TH-NiwatNeural` (ชาย) / `th-TH-PremwadeeNeural` (หญิง)
- ใส่ `"video": "clip.mp4"` เพื่อใช้คลิปจริงเป็นพื้นหลัง
- ภาพประกอบต่อฉาก: `"image": "img_x.jpg"` (ไฟล์ใน public/) หรือคำค้นภาษาอังกฤษ (หาอัตโนมัติ แต่อาจไม่ตรงเรื่อง)
- เลือกภาพเองให้ตรงเรื่อง (แนะนำ):
  ```bash
  python3 scripts/find_images.py "used car lot"          # -> out/candidates/.../sheet.jpg ภาพตัวเลือกมีเลข
  python3 scripts/find_images.py --pick "used car lot" 5 img_lot.jpg
  ```
  ภาพมาจาก Openverse (CC ใช้เชิงพาณิชย์ได้) — ต้องใส่เครดิตใน `"credit"`; หลีกเลี่ยง BY-ND (ห้ามดัดแปลง)

## ใช้งานกับคลิปที่ถ่ายเอง
```bash
cd video-template
npm install
pip install faster-whisper

# 1) วางคลิปไว้ที่ public/clip.mp4 แล้วถอดเสียง
mkdir -p out && python3 scripts/transcribe.py public/clip.mp4 > out/transcript.json

# 2) แก้ src/hook/sample.json: เพิ่ม "video": "clip.mp4"
#    (คลิปแนวนอนใส่ "sourceIsLandscape": true) แล้วเลือกประโยคใส่ hook/captions

# 3) เรนเดอร์
npm run render        # -> out/video.mp4
```
นอก Claude Code cloud ให้ลบ `--browser-executable=...` ออกจากสคริปต์ `render` ใน `package.json`

## รูปแบบ JSON
```json
{
  "video": "clip.mp4",
  "hook": [{"text": "โดนเต็นท์ชื่อดัง"}, {"text": "เอาเปรียบ !!", "color": "red"}],
  "hookEnd": 2.5,
  "captions": [
    {"start": 2.6, "end": 4.2, "lines": [{"text": "ซื้อรถมือสองมา"}, {"text": "เกือบ 10 คัน", "color": "yellow"}]}
  ]
}
```
`color`: `white` (ค่าเริ่มต้น) / `red` / `yellow` · เวลาเป็นวินาที
