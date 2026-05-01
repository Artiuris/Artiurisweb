import os, json, subprocess, glob, unicodedata, re
def slugify(v):
    v = unicodedata.normalize('NFKD', v).encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[-\s]+', '-', re.sub(r'[^\w\s-]', '', v).strip().lower())
base = "COLECCIÓN LUBE64 ARTE CONTEMPORÁNEO"
need = {'jose-otero-abeledo-l-a-x-e-i-r-o','jose-manuel-ballester','jose-artiaga','jose-noguero','jorge-perianes','joan-cabrer','jose-luis-cremades','jorge-castillo-casalderrey','jose-maria-diaz-maroto','jose-manuel-ciria'}
for d in sorted(os.listdir(base)):
    full = os.path.join(base, d)
    if not os.path.isdir(full): continue
    aid = slugify(d)
    if aid not in need: continue
    docs = [f for f in glob.glob(os.path.join(full, "*.doc*")) if not os.path.basename(f).startswith('~')]
    text = ""
    if docs:
        try:
            r = subprocess.run(['textutil', '-convert', 'txt', '-stdout', docs[0]], capture_output=True, text=True)
            text = r.stdout.strip()[:2500]
        except: pass
    print(f"=== {d} ({aid}) ===")
    print(text if text else "(no doc)")
    print()
