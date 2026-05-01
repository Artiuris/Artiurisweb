import os
import json
import re
import unicodedata
import shutil

def slugify(value):
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)

with open('extracted_data.json', 'r') as f:
    extracted = json.load(f)

json_path = 'web/src/data/artists.json'
with open(json_path, 'r') as f:
    artists_data = json.load(f)

artists_map = { a['name'].lower(): a for a in artists_data }

public_dir = 'web/public/images/artworks'
os.makedirs(public_dir, exist_ok=True)

for item in extracted:
    artist_name = item['artist']
    artist_key = artist_name.lower()
    
    # Process artist
    if artist_key not in artists_map:
        artist_id = slugify(artist_name)
        new_artist = {
            "id": artist_id,
            "name": artist_name,
            "birthYear": "",
            "birthPlace": "",
            "biography": item['bio_text'] if item['bio_text'] else "Biografía pendiente de añadir.",
            "photo": None,
            "works": []
        }
        artists_data.append(new_artist)
        artists_map[artist_key] = new_artist
    else:
        # Update biography if it was pending
        if "pendiente" in artists_map[artist_key]['biography'].lower() and item['bio_text']:
            artists_map[artist_key]['biography'] = item['bio_text']
            
    artist_obj = artists_map[artist_key]
    
    # Process artwork
    artwork_title = item['artwork']
    artwork_id = slugify(f"{artist_name}-{artwork_title}")
    
    # Ensure artist directory exists
    artist_public_dir = os.path.join(public_dir, artist_obj['id'])
    os.makedirs(artist_public_dir, exist_ok=True)
    
    # Copy image
    ext = os.path.splitext(item['image_path'])[1].lower()
    if not ext:
        ext = '.png'
    dest_filename = f"{slugify(artwork_title)}{ext}"
    dest_path = os.path.join(artist_public_dir, dest_filename)
    
    try:
        shutil.copy2(item['image_path'], dest_path)
    except Exception as e:
        print(f"Error copying {item['image_path']}: {e}")
        continue
        
    web_image_path = f"/images/artworks/{artist_obj['id']}/{dest_filename}"
    
    # Check if artwork already exists
    exists = False
    for w in artist_obj['works']:
        if w['id'] == artwork_id:
            exists = True
            w['image'] = web_image_path
            break
            
    if not exists:
        artist_obj['works'].append({
            "id": artwork_id,
            "title": artwork_title,
            "year": "",
            "technique": "",
            "dimensions": "",
            "image": web_image_path,
            "description": ""
        })

with open(json_path, 'w') as f:
    json.dump(artists_data, f, indent=2, ensure_ascii=False)

print(f"Updated artists.json and copied images.")
