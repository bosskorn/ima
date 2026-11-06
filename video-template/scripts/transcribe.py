"""ถอดเสียงวิดีโอเป็นข้อความพร้อมเวลา (ภาษาไทย) ด้วย faster-whisper

ใช้:  python3 scripts/transcribe.py public/clip.mp4 > out/transcript.json
ติดตั้งก่อน:  pip install faster-whisper
ผลลัพธ์: รายการ {start, end, text} ไว้เลือกประโยคมาใส่ใน src/hook/*.json
"""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

path = sys.argv[1]
size = sys.argv[2] if len(sys.argv) > 2 else "small"  # small / medium / large-v3 (แม่นขึ้นแต่ช้าลง)
# ถอดเสียงด้วย ffmpeg เอง (เลี่ยงปัญหาเวอร์ชัน PyAV)
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
model = WhisperModel(size, device="cpu", compute_type="int8")
segments, _ = model.transcribe(audio, language="th", vad_filter=True, word_timestamps=True)
out = [
    {
        "start": round(s.start, 2),
        "end": round(s.end, 2),
        "text": s.text.strip(),
        "words": [{"start": round(w.start, 2), "end": round(w.end, 2), "word": w.word} for w in (s.words or [])],
    }
    for s in segments
]
json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
