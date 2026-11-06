"""สร้างวิดีโอเองครบทุกขั้น ฟรี ไม่ใช้ API แบบเสียเงิน: บท -> เสียงพากย์ไทย -> ข้อความตามจังหวะเสียง -> เรนเดอร์

ใช้:  python3 scripts/make_video.py scripts/example_script.json out/video.mp4

เสียงพากย์:
  - "edge" (ค่าเริ่มต้น): เสียง Microsoft Neural ภาษาไทย ฟรี ไม่ต้องมี key (ต้องต่ออินเทอร์เน็ต)
  - "mms": โมเดล facebook/mms-tts-tha รันในเครื่อง 100% (เสียงด้อยกว่า) ใช้อัตโนมัติถ้า edge ล้มเหลว
ติดตั้ง:  pip install edge-tts transformers torch scipy
"""
import asyncio
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
GAP = 0.25  # วินาทีเว้นระหว่างประโยค
PROXY_CA = "/root/.ccr/ca-bundle.crt"  # Claude Code cloud: proxy CA


def tts_edge(text, voice, out):
    import certifi
    if os.path.exists(PROXY_CA):
        certifi.where = lambda: PROXY_CA
    import time

    import edge_tts
    for attempt in range(4):  # บริการฟรีบางครั้งไม่ตอบ ลองซ้ำ
        try:
            asyncio.run(edge_tts.Communicate(text, voice).save(out))
            return
        except Exception:  # noqa: BLE001
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))


_mms = None


def tts_mms(text, out):
    global _mms
    import scipy.io.wavfile
    import torch
    from transformers import AutoTokenizer, VitsModel
    if _mms is None:
        _mms = (VitsModel.from_pretrained("facebook/mms-tts-tha"), AutoTokenizer.from_pretrained("facebook/mms-tts-tha"))
    model, tok = _mms
    with torch.no_grad():
        wav = model(**tok(text, return_tensors="pt")).waveform[0].numpy()
    scipy.io.wavfile.write(out, model.config.sampling_rate, wav)


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(r.stdout.strip())


def main():
    script_path, out_path = sys.argv[1], sys.argv[2]
    s = json.load(open(script_path, encoding="utf-8"))
    engine, voice = s.get("tts", "edge"), s.get("voice", "th-TH-NiwatNeural")
    segments = [s["hook"]] + s["scenes"]
    tmp = tempfile.mkdtemp()
    files, t, times = [], 0.0, []
    for i, seg in enumerate(segments):
        f = os.path.join(tmp, f"{i}.wav")
        raw = os.path.join(tmp, f"{i}.raw")
        try:
            if engine != "edge":
                raise RuntimeError("mms selected")
            tts_edge(seg["say"], voice, raw)
        except Exception as e:  # noqa: BLE001
            if engine == "edge":
                print(f"edge-tts ใช้ไม่ได้ ({e}); ใช้ mms แทน", file=sys.stderr)
            tts_mms(seg["say"], raw)
        # ทำทุกไฟล์ให้ฟอร์แมตเดียวกัน + เติมช่วงเงียบท้ายประโยค
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-ar", "44100", "-ac", "1", "-af", f"apad=pad_dur={GAP}", f], check=True)
        d = duration(f)
        times.append((t, t + d - GAP))
        files.append(f)
        t += d
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as fh:
        fh.writelines(f"file '{f}'\n" for f in files)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:a", "aac", "-b:a", "160k", os.path.join(PUBLIC, "voice.m4a")], check=True)

    props = {
        "hook": s["hook"]["lines"],
        "hookEnd": round(times[0][1] + 0.15, 2),
        "captions": [{"start": round(a, 2), "end": round(b + 0.15, 2), "lines": seg["lines"]} for (a, b), seg in zip(times[1:], s["scenes"])],
        "audio": "voice.m4a",
    }
    for k in ("video", "sourceIsLandscape"):
        if k in s:
            props[k] = s[k]
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    props_path = os.path.join(ROOT, "out", "props.json")
    json.dump(props, open(props_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    cmd = ["npx", "remotion", "render", "src/index.ts", "Hook", os.path.abspath(out_path), f"--props={props_path}", "--overwrite", "--log=error"]
    if os.path.exists("/opt/pw-browsers/chromium"):
        cmd.append("--browser-executable=/opt/pw-browsers/chromium")
    subprocess.run(cmd, check=True, cwd=ROOT)
    print(f"เสร็จ: {out_path} ({t:.1f} วินาที)")


if __name__ == "__main__":
    main()
