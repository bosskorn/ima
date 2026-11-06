"""สร้างเสียงพากย์ทีละฉากสำหรับการ์ตูนเล่าเรื่อง แล้วเขียนเวลาแต่ละฉากลง src/cartoon/story.json

ใช้: python3 scripts/story_voice.py src/cartoon/story_script.json
"""
import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_video import PUBLIC, ROOT, duration, tts_edge, tts_mms  # noqa: E402

GAP = 0.45


def main():
    s = json.load(open(sys.argv[1], encoding="utf-8"))
    voice = s.get("voice", "th-TH-NiwatNeural")
    tmp = tempfile.mkdtemp()
    files, t, scenes = [], 0.0, []
    for i, sc in enumerate(s["scenes"]):
        raw, f = os.path.join(tmp, f"{i}.raw"), os.path.join(tmp, f"{i}.wav")
        try:
            tts_edge(sc["say"], voice, raw)
        except Exception as e:  # noqa: BLE001
            print(f"edge-tts ล้มเหลว ({e}) ใช้ mms", file=sys.stderr)
            tts_mms(sc["say"], raw)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-ar", "44100", "-ac", "1", "-af", f"apad=pad_dur={GAP}", f], check=True)
        d = duration(f)
        scenes.append({**{k: v for k, v in sc.items() if k != "say"}, "start": round(t, 2), "end": round(t + d, 2)})
        files.append(f)
        t += d
    lst = os.path.join(tmp, "l.txt")
    open(lst, "w").writelines(f"file '{f}'\n" for f in files)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:a", "aac", "-b:a", "160k", os.path.join(PUBLIC, "story_vo.m4a")], check=True)
    out = os.path.join(ROOT, "src", "cartoon", "story.json")
    json.dump({"audio": "story_vo.m4a", "scenes": scenes}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"รวม {t:.1f} วินาที -> {out}")


if __name__ == "__main__":
    main()
