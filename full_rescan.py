import os, json, glob, subprocess, unicodedata, re, shutil, hashlib

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

def extract_tech(text):
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

# Collect ALL Foto OK files, grouped by (artist_id, artwork_folder)
from collections import defaultdict
artwork_files = defaultdict(list)

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.startswith('._'): continue
        # Match "Foto OK" variants: "Foto OK.png", "Foto OK_N2.png", "Foto OK_N3.jpg", etc.
        if not re.match(r'^Foto OK', file): continue
        
        image_path = os.path.join(root, file)
        parts = image_path.split(os.sep)
        artist_name = parts[1]
        artist_id = slugify(artist_name)
        artwork_folder = parts[2] if len(parts) > 3 else "Sin Título"
        
        # Determine if this is the main image or an extra (N2, N3, etc.)
        is_extra = bool(re.search(r'_N\d+', file))
        extra_num = 0
        em = re.search(r'_N(\d+)', file)
        if em: extra_num = int(em.group(1))
        
        artwork_files[(artist_id, artist_name, artwork_folder)].append({
            'path': image_path,
            'file': file,
            'is_extra': is_extra,
            'extra_num': extra_num,
            'ext': os.path.splitext(file)[1].lower() or '.png'
        })

new_count = 0
upd_count = 0
extra_count = 0

for (artist_id, artist_name, artwork_folder), file_list in artwork_files.items():
    # Sort: main first, then by extra number
    file_list.sort(key=lambda x: (x['is_extra'], x['extra_num']))
    
    main_file = file_list[0]
    extra_files = [f for f in file_list if f['is_extra']]
    
    # Find doc for tech info
    artist_dir = os.path.join(base_dir, artist_name)
    artwork_dir = os.path.dirname(main_file['path'])
    docs_here = [d for d in glob.glob(os.path.join(artwork_dir, "*.doc*")) if not os.path.basename(d).startswith('~')]
    docs_artist = [d for d in glob.glob(os.path.join(artist_dir, "*.doc*")) if not os.path.basename(d).startswith('~')]
    best_doc = (docs_here[0] if docs_here else docs_artist[0]) if (docs_here or docs_artist) else None
    raw_text = get_text(best_doc) if best_doc else ""
    ext_title, ext_tech, ext_year, ext_dim = extract_tech(raw_text)
    
    if ext_title and ext_title.lower() not in ['s/t', 'sin título', 'sin titulo']:
        real_title = ext_title
    else:
        real_title = artwork_folder if artwork_folder.lower() not in ['foto ok', 'imágenes de la obra', 'imagenes de la obra'] else "Sin Título"
    
    dest_dir = os.path.join('web/public/images/artworks', artist_id)
    os.makedirs(dest_dir, exist_ok=True)
    
    main_dest_filename = f"{slugify(artwork_folder)}{main_file['ext']}"
    main_dest_path = os.path.join(dest_dir, main_dest_filename)
    main_image_rel = f"/images/artworks/{artist_id}/{main_dest_filename}"
    
    # ALWAYS re-copy the main image (user may have swapped files)
    shutil.copy2(main_file['path'], main_dest_path)
    
    # Copy extra images
    extra_image_rels = []
    for ef in extra_files:
        ef_dest_name = f"{slugify(artwork_folder)}-n{ef['extra_num']}{ef['ext']}"
        ef_dest_path = os.path.join(dest_dir, ef_dest_name)
        shutil.copy2(ef['path'], ef_dest_path)
        extra_image_rels.append(f"/images/artworks/{artist_id}/{ef_dest_name}")
        extra_count += 1
    
    # Find or create artist
    artist = next((a for a in artists if a['id'] == artist_id), None)
    if not artist:
        artist = {"id": artist_id, "name": artist_name, "biography": "Biografía pendiente.", "works": []}
        artists.append(artist)
    
    # Find or create work
    existing_work = next((w for w in artist['works'] if w.get('image') == main_image_rel), None)
    
    if existing_work:
        # Update tech data if missing
        changed = False
        if ext_tech and not existing_work.get('technique'): existing_work['technique'] = ext_tech; changed = True
        if ext_year and not existing_work.get('year'): existing_work['year'] = ext_year; changed = True
        if ext_dim and not existing_work.get('dimensions'): existing_work['dimensions'] = ext_dim; changed = True
        if ext_title and ext_title.lower() not in ['s/t','sin título','sin titulo'] and existing_work.get('title','').lower() in ['s/t','sin título','sin titulo']:
            existing_work['title'] = ext_title; changed = True
        
        # Update extra images
        if extra_image_rels:
            existing_work['images'] = extra_image_rels
            changed = True
            
        if changed: upd_count += 1
    else:
        work_id = f"{artist_id}-{slugify(real_title)}"
        base_wid = work_id; c = 1
        while any(w['id'] == work_id for w in artist['works']):
            work_id = f"{base_wid}-{c}"; c += 1
        
        nw = {"id": work_id, "title": real_title, "image": main_image_rel}
        if ext_tech: nw["technique"] = ext_tech
        if ext_year: nw["year"] = ext_year
        if ext_dim: nw["dimensions"] = ext_dim
        if extra_image_rels: nw["images"] = extra_image_rels
        artist['works'].append(nw)
        new_count += 1
        print(f"NEW: {artist_name} — {real_title}")

with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)

print(f"\nDone. NEW: {new_count} | UPDATED: {upd_count} | Extra images added: {extra_count}")
print(f"Total: {len(artists)} artists, {sum(len(a['works']) for a in artists)} artworks")
