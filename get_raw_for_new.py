import os, json, subprocess, glob, unicodedata, re

def slugify(value):
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)

base_dir = "COLECCIÓN LUBE64 ARTE CONTEMPORÁNEO"
need = {'enrique-larroy', 'fernando-yanez', 'iago-eireos', 'francisco-reina', 'gino-rubert', 'gonzalo-perez-mata', 'enrique-martinez-cubells', 'eulalia-valdosera', 'fernando-bayona', 'hector-orruno', 'isabel-tallos', 'francisco-otero-besteiro', 'german-gomez', 'eva-lootz', 'felicidad-moreno', 'fernando-sanchez-calderon', 'javier-pagola', 'jesus-otero-yglesias', 'hannah-collins', 'florencio-alonso', 'ismael-iglesias-serrano', 'guillermo-mora'}

for d in sorted(os.listdir(base_dir)):
    full = os.path.join(base_dir, d)
    if not os.path.isdir(full): continue
    aid = slugify(d)
    if aid not in need: continue
    docs = [f for f in glob.glob(os.path.join(full, "*.doc*")) if not os.path.basename(f).startswith('~')]
    text = ""
    if docs:
        try:
            r = subprocess.run(['textutil', '-convert', 'txt', '-stdout', docs[0]], capture_output=True, text=True)
            text = r.stdout.strip()[:2000]
        except: pass
    print(f"=== {d} ({aid}) ===")
    print(text if text else "(no doc found)")
    print()
