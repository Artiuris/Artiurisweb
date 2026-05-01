import json
import os
import re
import shutil

with open('new_data.json', 'r') as f:
    new_data = json.load(f)

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

def clean_text(text):
    # Remove excessive newlines and tabs
    text = re.sub(r'[\t\r\n]+', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def summarize_bio(text):
    if not text: return "Biografía pendiente."
    
    lines = text.split('\n')
    paragraphs = []
    
    for line in lines:
        line = line.strip()
        # Skip empty lines, lines starting with bullets, dates, or headers
        if not line: continue
        if re.match(r'^[\W\d]', line): continue 
        if line.isupper() and len(line) < 50: continue
        if "EXPOSICI" in line.upper() or "MUSEO" in line.upper() or "PREMIO" in line.upper(): continue
        
        paragraphs.append(line)
        
    full_text = clean_text(" ".join(paragraphs))
    
    if len(full_text) > 950:
        # Try to cut at the last sentence boundary before 950
        cut_text = full_text[:950]
        last_period = cut_text.rfind('.')
        if last_period > 0:
            return cut_text[:last_period+1]
        else:
            return cut_text + "..."
    
    return full_text if full_text else "Biografía pendiente."

def extract_tech(text):
    title = ""
    technique = ""
    year = ""
    
    title_match = re.search(r'(?i)t[ií]tulo[\s]*:?\s*[“"”]?([^"”\n\.]+)[”"”\.]?', text)
    if title_match: 
        title = title_match.group(1).strip()
        title = re.sub(r'["“”]', '', title)
        
    tech_match = re.search(r'(?i)t[eé]cnica[\s]*:?\s*([^.\n]+)', text)
    if tech_match: technique = tech_match.group(1).strip()
    
    year_match = re.search(r'(?i)a[ñn]o[\s]*:?\s*([12][0-9]{3})', text)
    if year_match: year = year_match.group(1).strip()
    
    return title, technique, year

for item in new_data:
    artist_id = item['artist_id']
    artist_name = item['artist_name']
    raw_text = item.get('raw_text', '')
    
    # 1. Summarize bio and extract tech
    bio_summary = summarize_bio(raw_text)
    ext_title, ext_tech, ext_year = extract_tech(raw_text)
    
    # Determine the real title
    folder_title = item['artwork_folder']
    if ext_title and ext_title.lower() != 's/t' and ext_title.lower() != 'sin título':
        real_title = ext_title
    else:
        real_title = folder_title if folder_title and folder_title.lower() != 'foto ok' else "Sin Título"
        
    # Create artwork ID
    import unicodedata
    def slug(val):
        val = unicodedata.normalize('NFKD', val).encode('ascii', 'ignore').decode('ascii')
        return re.sub(r'[^\w\s-]', '', val).strip().lower().replace(' ', '-')
        
    work_id = f"{artist_id}-{slug(real_title)}"
    # ensure uniqueness
    # check existing works in this artist
    
    # Check if artist exists
    artist = next((a for a in artists if a['id'] == artist_id), None)
    if not artist:
        artist = {
            "id": artist_id,
            "name": artist_name,
            "biography": bio_summary,
            "works": []
        }
        artists.append(artist)
    else:
        # If the existing bio is 'Biografía pendiente' or very short, update it
        if len(artist.get('biography', '')) < 50 and len(bio_summary) > 50:
            artist['biography'] = bio_summary
            
    # Handle image copy
    dest_dir = os.path.join('web/public/images/artworks', artist_id)
    os.makedirs(dest_dir, exist_ok=True)
    
    dest_filename = item['dest_filename']
    dest_path = os.path.join(dest_dir, dest_filename)
    
    # Copy file if it doesn't exist
    if not os.path.exists(dest_path):
        try:
            shutil.copy2(item['image_path'], dest_path)
        except Exception as e:
            print(f"Error copying {item['image_path']}: {e}")
            continue
            
    image_rel_path = f"/images/artworks/{artist_id}/{dest_filename}"
    
    # Deduplicate work_id inside the artist
    base_work_id = work_id
    counter = 1
    while any(w['id'] == work_id for w in artist['works']):
        work_id = f"{base_work_id}-{counter}"
        counter += 1
        
    new_work = {
        "id": work_id,
        "title": real_title,
        "image": image_rel_path
    }
    
    if ext_tech: new_work["technique"] = ext_tech
    if ext_year: new_work["year"] = ext_year
    
    artist['works'].append(new_work)

with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)

print("Updated artists.json successfully.")
