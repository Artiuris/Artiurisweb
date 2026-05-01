import json
import os
import glob
import subprocess
import re
import unicodedata

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

def extract_tech_blocks(text):
    blocks = []
    # Try to split by + TITULO or = FICHA TECNICA
    # This is a bit tricky, let's just do a global search for TÍTULO: ... TÉCNICA: ... AÑO:
    
    # Let's find all occurrences of TÍTULO:
    title_matches = list(re.finditer(r'(?i)t[ií]tulo[\s]*:?\s*[“"”]?([^"”\n\.]+)[”"”\.]?', text))
    
    if not title_matches:
        return blocks
        
    for i, match in enumerate(title_matches):
        start_pos = match.start()
        end_pos = title_matches[i+1].start() if i + 1 < len(title_matches) else len(text)
        block_text = text[start_pos:end_pos]
        
        title = match.group(1).strip()
        title = re.sub(r'["“”]', '', title)
        
        technique = ""
        tech_match = re.search(r'(?i)t[eé]cnica[\s]*:?\s*([^.\n]+)', block_text)
        if tech_match: technique = tech_match.group(1).strip()
        
        year = ""
        year_match = re.search(r'(?i)a[ñn]o[\s]*:?\s*([12][0-9]{3})', block_text)
        if year_match: year = year_match.group(1).strip()
        
        blocks.append({"title": title, "technique": technique, "year": year})
        
    return blocks

updated_count = 0

for artist in artists:
    # Try to find the artist folder in the base dir
    artist_dir = None
    for d in os.listdir(base_dir):
        if os.path.isdir(os.path.join(base_dir, d)) and slugify(d) == artist['id']:
            artist_dir = os.path.join(base_dir, d)
            break
            
    if not artist_dir:
        continue
        
    # Find all docs in artist dir and subdirs
    all_docs = []
    for root, dirs, files in os.walk(artist_dir):
        for f in files:
            if f.endswith('.doc') or f.endswith('.docx'):
                if not f.startswith('~'):
                    all_docs.append(os.path.join(root, f))
                    
    # Parse all docs for this artist
    all_techs = []
    for doc in all_docs:
        text = get_text_from_doc(doc)
        if text:
            techs = extract_tech_blocks(text)
            all_techs.extend(techs)
            
    if not all_techs:
        continue
        
    # If there's exactly 1 work and 1 tech block, or 1 work and multiple tech blocks (take the first)
    if len(artist['works']) == 1 and len(all_techs) > 0:
        w = artist['works'][0]
        t = all_techs[0]
        
        changed = False
        if w['title'].lower() in ['sin título', 'sin titulo', 's/t'] and t['title'].lower() not in ['sin título', 'sin titulo', 's/t']:
            w['title'] = t['title']
            changed = True
            
        if t['technique'] and not w.get('technique'):
            w['technique'] = t['technique']
            changed = True
            
        if t['year'] and not w.get('year'):
            w['year'] = t['year']
            changed = True
            
        if changed:
            updated_count += 1
            print(f"Updated {artist['name']} - {w['title']}")
            
    # If there are multiple works, try to match by title if they already have titles, 
    # but since we're trying to fix "Sin Título", we can't reliably match multiple "Sin Título" to multiple blocks.
    # We can match by looking at the artwork folder name.
    elif len(artist['works']) > 1:
        # Not easily safe to blind guess, but if we have exactly matching counts we could assume order? No.
        pass

with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)

print(f"Total artworks updated: {updated_count}")
