#!/usr/bin/env python3
"""ดึงผลหวยลาวพัฒนาย้อนหลังจาก Sanook -> data/laos_pattana.csv
usage: python3 scripts/laos_pattana.py [max_tag_pages]"""
import re, sys, time, csv, subprocess, urllib.parse
MONTHS = {m: i + 1 for i, m in enumerate("มกราคม กุมภาพันธ์ มีนาคม เมษายน พฤษภาคม มิถุนายน กรกฎาคม สิงหาคม กันยายน ตุลาคม พฤศจิกายน ธันวาคม".split())}
def get(url, tries=5):
    for i in range(tries):
        r = subprocess.run(["curl", "-sSL", "-m", "30", "-A", "Mozilla/5.0", url], capture_output=True)
        if r.returncode == 0 and len(r.stdout) > 5000:
            return r.stdout.decode("utf8", "ignore")
        time.sleep(2 + i)
    return ""
def text(h):
    h = re.sub(r"<script.*?</script>|<style.*?</style>", "", h, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h))
tag = "https://www.sanook.com/news/tag/" + urllib.parse.quote("หวยลาว") + "/"
urls, pages = [], int(sys.argv[1]) if len(sys.argv) > 1 else 5
for p in range(1, pages + 1):
    h = get(tag if p == 1 else f"{tag}?page={p}")
    found = [u for u, t in re.findall(r'href="(https://www\.sanook\.com/news/\d+/)"[^>]*>(.*?)</a>', h, flags=re.S) if "หวยลาววันนี้" in t]
    new = [u for u in dict.fromkeys(found) if u not in urls]
    print("tag page", p, len(new), "new"); urls += new
    if not new: break
res = {}
pat = re.compile(r"(\d{1,2}) (" + "|".join(MONTHS) + r") (25\d\d|\d{2}) เลข 6 ตัว : (\d{6})")
pat2 = re.compile(r"(\d{1,2})/(\d{1,2})/(\d{2}) เลข 6 ตัว : (\d{6})")
for u in urls:
    t = text(get(u))
    for d, m, y, n in pat.findall(t):
        y = int(y); y = y + 2500 if y < 100 else y
        res[(y - 543, MONTHS[m], int(d))] = n
    for d, m, y, n in pat2.findall(t):
        res[(int(y) + 2500 - 543, int(m), int(d))] = n
    print(u, len(res))
with open("data/laos_pattana.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["date", "digits6", "digits4", "digits3", "digits2"])
    for (y, m, d), n in sorted(res.items(), reverse=True):
        w.writerow([f"{y}-{m:02d}-{d:02d}", n, n[2:], n[3:], n[4:]])
print("rows", len(res))
