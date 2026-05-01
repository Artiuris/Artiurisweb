import os
import json
import glob
import subprocess
import unicodedata
import re
import shutil

def slugify(value):
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)

base_dir = "COLECCIÓN LUBE64 ARTE CONTEMPORÁNEO"

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

def get_text_from_doc(doc_path):
    try:
        result = subprocess.run(['textutil', '-convert', 'txt', '-stdout', doc_path], capture_output=True, text=True)
        return result.stdout.strip()
    except:
        return ""

def clean_text(text):
    text = re.sub(r'[\t\r\n]+', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def summarize_bio(text):
    if not text: return "Biografía pendiente."
    lines = text.split('\n')
    paragraphs = []
    for line in lines:
        line = line.strip()
        if not line: continue
        if re.match(r'^[\W\d]', line): continue 
        if line.isupper() and len(line) < 50: continue
        if "EXPOSICI" in line.upper() or "MUSEO" in line.upper() or "PREMIO" in line.upper(): continue
        paragraphs.append(line)
    
    full_text = clean_text(" ".join(paragraphs))
    if len(full_text) > 950:
        cut_text = full_text[:950]
        last_period = cut_text.rfind('.')
        if last_period > 0: return cut_text[:last_period+1]
        else: return cut_text + "..."
    return full_text if full_text else "Biografía pendiente."

def extract_tech(text, specific_folder_name=""):
    title = ""
    technique = ""
    year = ""
    dimensions = ""
    
    # Try to find a block specifically matching this artwork folder name, OR just get the first one
    # Simple regex extraction for now
    title_match = re.search(r'(?i)t[ií]tulo[\s]*:?\s*[“"”]?([^"”\n\.]+)[”"”\.]?', text)
    if title_match: title = re.sub(r'["“”]', '', title_match.group(1).strip())
        
    tech_match = re.search(r'(?i)t[eé]cnica[\s]*:?\s*([^.\n]+)', text)
    if tech_match: technique = tech_match.group(1).strip()
    
    year_match = re.search(r'(?i)a[ñn]o[\s]*:?\s*([12][0-9]{3})', text)
    if year_match: year = year_match.group(1).strip()
    
    dim_match = re.search(r'(?i)medidas[\s]*:?\s*([^.\n]+)', text)
    if dim_match: dimensions = dim_match.group(1).strip()
    
    return title, technique, year, dimensions

existing_images = set()
for a in artists:
    for w in a['works']:
        if w.get('image'):
            filename = os.path.basename(w['image'])
            existing_images.add(f"{a['id']}/{filename}")

new_artworks = 0
updated_artworks = 0

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if "Foto OK" in file and not file.startswith('._'):
            image_path = os.path.join(root, file)
            parts = image_path.split(os.sep)
            
            artist_name = parts[1]
            artist_id = slugify(artist_name)
            artwork_folder = parts[2] if len(parts) > 3 else "Sin Título"
            
            ext = os.path.splitext(file)[1].lower()
            if not ext: ext = '.png'
            dest_filename = f"{slugify(artwork_folder)}{ext}"
            check_key = f"{artist_id}/{dest_filename}"
            
            # Find closest doc file (in artwork folder first, then artist folder)
            docs_in_artwork = glob.glob(os.path.join(root, "*.doc*"))
            docs_in_artist = glob.glob(os.path.join(base_dir, artist_name, "*.doc*"))
            
            best_doc = None
            if docs_in_artwork and not os.path.basename(docs_in_artwork[0]).startswith('~'):
                best_doc = docs_in_artwork[0]
            elif docs_in_artist and not os.path.basename(docs_in_artist[0]).startswith('~'):
                best_doc = docs_in_artist[0]
                
            raw_text = ""
            if best_doc: raw_text = get_text_from_doc(best_doc)
            
            ext_title, ext_tech, ext_year, ext_dim = extract_tech(raw_text, artwork_folder)
            
            real_title = ext_title if (ext_title and ext_title.lower() not in ['s/t', 'sin título']) else artwork_folder
            if real_title.lower() == 'foto ok': real_title = "Sin Título"
            
            artist = next((a for a in artists if a['id'] == artist_id), None)
            is_new = check_key not in existing_images
            
            if is_new:
                bio_summary = summarize_bio(raw_text)
                
                if not artist:
                    artist = {"id": artist_id, "name": artist_name, "biography": bio_summary, "works": []}
                    artists.append(artist)
                else:
                    if len(artist.get('biography', '')) < 50 and len(bio_summary) > 50:
                        artist['biography'] = bio_summary
                        
                dest_dir = os.path.join('web/public/images/artworks', artist_id)
                os.makedirs(dest_dir, exist_ok=True)
                dest_path = os.path.join(dest_dir, dest_filename)
                
                if not os.path.exists(dest_path):
                    shutil.copy2(image_path, dest_path)
                    
                work_id = f"{artist_id}-{slugify(real_title)}"
                base_work_id = work_id
                counter = 1
                while any(w['id'] == work_id for w in artist['works']):
                    work_id = f"{base_work_id}-{counter}"
                    counter += 1
                    
                new_work = {
                    "id": work_id,
                    "title": real_title,
                    "image": f"/images/artworks/{artist_id}/{dest_filename}"
                }
                if ext_tech: new_work["technique"] = ext_tech
                if ext_year: new_work["year"] = ext_year
                if ext_dim: new_work["dimensions"] = ext_dim
                
                artist['works'].append(new_work)
                new_artworks += 1
                print(f"NEW: {artist_name} - {real_title}")
                
            else:
                # Existing artwork, let's see if we can update tech/dimensions
                if artist:
                    # find the work
                    target_work = None
                    for w in artist['works']:
                        if w.get('image') and os.path.basename(w['image']) == dest_filename:
                            target_work = w
                            break
                            
                    if target_work:
                        changed = False
                        if ext_tech and not target_work.get('technique'):
                            target_work['technique'] = ext_tech
                            changed = True
                        if ext_year and not target_work.get('year'):
                            target_work['year'] = ext_year
                            changed = True
                        if ext_dim and not target_work.get('dimensions'):
                            target_work['dimensions'] = ext_dim
                            changed = True
                        if ext_title and ext_title.lower() not in ['s/t', 'sin título'] and target_work.get('title', '').lower() in ['s/t', 'sin título']:
                            target_work['title'] = ext_title
                            changed = True
                            
                        if changed:
                            updated_artworks += 1
                            print(f"UPDATED: {artist_name} - {target_work['title']}")

with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)

print(f"Done. Added {new_artworks} new artworks. Updated {updated_artworks} existing artworks.")
