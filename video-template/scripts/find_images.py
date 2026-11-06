"""ค้นภาพฟรี (Creative Commons ใช้เชิงพาณิชย์ได้) จาก Openverse แล้วทำภาพรวมตัวเลือกให้เลือกด้วยตา

ใช้:   python3 scripts/find_images.py "used car lot" [จำนวน=12]
ผล:   out/candidates/<คำค้น>/sheet.jpg (ภาพตัวเลือกมีเลขกำกับ) + meta.json
เลือก: python3 scripts/find_images.py --pick "used car lot" 3 img_lot.jpg
       -> คัดลอกภาพที่ 3 ไปเป็น public/img_lot.jpg และพิมพ์เครดิต
       แล้วใส่ "image": "img_lot.jpg" ในบท
"""
import json
import os
import re
import shutil
import ssl
import subprocess
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROXY_CA = "/root/.ccr/ca-bundle.crt"
CTX = ssl.create_default_context(cafile=PROXY_CA) if os.path.exists(PROXY_CA) else None
HDR = {"User-Agent": "ima-video-template/1.0"}


def get(url, timeout=30):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HDR), timeout=timeout, context=CTX) as r:
                return r.read()
        except Exception:  # noqa: BLE001
            if attempt == 2:
                raise
            time.sleep(3 * (attempt + 1))


def folder(query):
    return os.path.join(ROOT, "out", "candidates", re.sub(r"[^a-z0-9]+", "_", query.lower()).strip("_"))


def search(query, n):
    d = folder(query)
    os.makedirs(d, exist_ok=True)
    q = urllib.parse.urlencode({"q": query, "license_type": "commercial", "page_size": 20})
    results = json.loads(get(f"https://api.openverse.org/v1/images/?{q}"))["results"]
    meta = []
    for res in results:
        if len(meta) >= n:
            break
        if (res.get("width") or 0) < 700:
            continue
        fn = os.path.join(d, f"{len(meta) + 1}.jpg")
        try:
            open(fn, "wb").write(get(res["url"]))
        except Exception:  # noqa: BLE001
            continue
        meta.append({"n": len(meta) + 1, "file": fn, "title": res.get("title"), "creator": res.get("creator"),
                     "license": f"{res['license'].upper()} {res.get('license_version') or ''}".strip(), "source": res.get("foreign_landing_url")})
    json.dump(meta, open(os.path.join(d, "meta.json"), "w"), ensure_ascii=False, indent=1)
    # ภาพรวม: ช่องละ 300x400 พร้อมเลข
    inputs, filters = [], []
    for i, m in enumerate(meta):
        inputs += ["-i", m["file"]]
        filters.append(f"[{i}:v]scale=300:400:force_original_aspect_ratio=increase,crop=300:400,"
                       f"drawtext=text='{m['n']}':fontsize=60:fontcolor=yellow:borderw=4:x=12:y=8[v{i}]")
    cols = 4
    layout = "|".join(f"{(i % cols) * 300}_{(i // cols) * 400}" for i in range(len(meta)))
    fc = ";".join(filters) + ";" + "".join(f"[v{i}]" for i in range(len(meta))) + f"xstack=inputs={len(meta)}:layout={layout}:fill=black"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-frames:v", "1", os.path.join(d, "sheet.jpg")], check=True)
    print(os.path.join(d, "sheet.jpg"))
    for m in meta:
        print(m["n"], m["title"], "|", m["license"])


def pick(query, n, dest):
    meta = json.load(open(os.path.join(folder(query), "meta.json")))
    m = next(x for x in meta if x["n"] == int(n))
    shutil.copy(m["file"], os.path.join(ROOT, "public", dest))
    print(f"public/{dest}  เครดิต: {m['creator']} / {m['license']}  ({m['source']})")


if __name__ == "__main__":
    if sys.argv[1] == "--pick":
        pick(*sys.argv[2:5])
    else:
        search(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 12)
