import os, json, glob, subprocess, unicodedata, re, shutil

def slugify(value):
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)

base_dir = "COLECCIÓN LUBE64 ARTE CONTEMPORÁNEO"

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

def get_text(doc_path):
    try:
        r = subprocess.run(['textutil', '-convert', 'txt', '-stdout', doc_path], capture_output=True, text=True)
        return r.stdout.strip()
    except: return ""

def extract_tech_from_block(text):
    title = technique = year = dimensions = ""
    m = re.search(r'(?i)t[ií]tulo[\s]*:?\s*["""]?([^""\n\.]+)["""\.]?', text)
    if m: title = re.sub(r'["""]', '', m.group(1).strip())
    m = re.search(r'(?i)t[eé]cnica[\s]*:?\s*([^.\n]+)', text)
    if m: technique = m.group(1).strip()
    m = re.search(r'(?i)a[ñn]o[\s]*:?\s*([12][0-9]{3})', text)
    if m: year = m.group(1).strip()
    m = re.search(r'(?i)medidas[\s]*:?\s*([^.\n]+)', text)
    if m: dimensions = m.group(1).strip()
    return title, technique, year, dimensions

# Build index of existing images
existing_images = set()
for a in artists:
    for w in a['works']:
        if w.get('image'):
            existing_images.add(f"{a['id']}/{os.path.basename(w['image'])}")

new_count = 0
upd_count = 0
new_artist_ids = set()

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if "Foto OK" not in file or file.startswith('._'): continue
        image_path = os.path.join(root, file)
        parts = image_path.split(os.sep)
        artist_name = parts[1]
        artist_id = slugify(artist_name)
        artwork_folder = parts[2] if len(parts) > 3 else "Sin Título"

        ext = os.path.splitext(file)[1].lower() or '.png'
        dest_filename = f"{slugify(artwork_folder)}{ext}"
        check_key = f"{artist_id}/{dest_filename}"

        # Find docs: prefer artwork-level, fallback to artist-level
        docs_here = [d for d in glob.glob(os.path.join(root, "*.doc*")) if not os.path.basename(d).startswith('~')]
        docs_artist = [d for d in glob.glob(os.path.join(base_dir, artist_name, "*.doc*")) if not os.path.basename(d).startswith('~')]
        best_doc = (docs_here[0] if docs_here else docs_artist[0]) if (docs_here or docs_artist) else None
        raw_text = get_text(best_doc) if best_doc else ""

        ext_title, ext_tech, ext_year, ext_dim = extract_tech_from_block(raw_text)

        # Determine real title: ficha técnica title > folder name
        if ext_title and ext_title.lower() not in ['s/t', 'sin título', 'sin titulo']:
            real_title = ext_title
        else:
            real_title = artwork_folder if artwork_folder.lower() not in ['foto ok', 'imágenes de la obra', 'imagenes de la obra'] else "Sin Título"

        artist = next((a for a in artists if a['id'] == artist_id), None)
        is_new = check_key not in existing_images

        if is_new:
            if not artist:
                artist = {"id": artist_id, "name": artist_name, "biography": "Biografía pendiente.", "works": []}
                artists.append(artist)
                new_artist_ids.add(artist_id)

            dest_dir = os.path.join('web/public/images/artworks', artist_id)
            os.makedirs(dest_dir, exist_ok=True)
            dest_path = os.path.join(dest_dir, dest_filename)
            if not os.path.exists(dest_path):
                shutil.copy2(image_path, dest_path)

            work_id = f"{artist_id}-{slugify(real_title)}"
            base_wid = work_id; c = 1
            while any(w['id'] == work_id for w in artist['works']):
                work_id = f"{base_wid}-{c}"; c += 1

            nw = {"id": work_id, "title": real_title, "image": f"/images/artworks/{artist_id}/{dest_filename}"}
            if ext_tech: nw["technique"] = ext_tech
            if ext_year: nw["year"] = ext_year
            if ext_dim: nw["dimensions"] = ext_dim
            artist['works'].append(nw)
            new_count += 1
            print(f"NEW: {artist_name} — {real_title}")
        else:
            # Update existing work tech data
            if artist:
                tw = next((w for w in artist['works'] if w.get('image') and os.path.basename(w['image']) == dest_filename), None)
                if tw:
                    changed = False
                    if ext_tech and not tw.get('technique'): tw['technique'] = ext_tech; changed = True
                    if ext_year and not tw.get('year'): tw['year'] = ext_year; changed = True
                    if ext_dim and not tw.get('dimensions'): tw['dimensions'] = ext_dim; changed = True
                    if ext_title and ext_title.lower() not in ['s/t','sin título','sin titulo'] and tw.get('title','').lower() in ['s/t','sin título','sin titulo']:
                        tw['title'] = ext_title; changed = True
                    if changed: upd_count += 1; print(f"UPD: {artist_name} — {tw['title']}")

# --- Duplicate check ---
print("\n=== DUPLICATE CHECK ===")
from collections import Counter
id_counts = Counter(a['id'] for a in artists)
for aid, cnt in id_counts.items():
    if cnt > 1: print(f"DUPLICATE ID: {aid} appears {cnt} times!")
name_norm = {}
for a in artists:
    key = re.sub(r'\s+', ' ', a['name'].strip().upper())
    name_norm.setdefault(key, []).append(a['id'])
for name, ids in name_norm.items():
    if len(ids) > 1: print(f"DUPLICATE NAME: '{name}' -> {ids}")
# Check similar slugs
slugs = [a['id'] for a in artists]
for i, s1 in enumerate(slugs):
    for s2 in slugs[i+1:]:
        # Check if one is substring of the other or very similar
        if s1 in s2 or s2 in s1:
            if s1 != s2:
                print(f"SIMILAR IDs: {s1} / {s2}")

with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)

print(f"\nDone. NEW: {new_count} | UPDATED: {upd_count} | New artists needing bios: {new_artist_ids}")
print(f"Total: {len(artists)} artists, {sum(len(a['works']) for a in artists)} artworks")
