import os
import json
import glob
import subprocess
import unicodedata
import re

def slugify(value):
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)

base_dir = "COLECCIÓN LUBE64 ARTE CONTEMPORÁNEO"

# Load existing artists to avoid duplicates
with open('web/src/data/artists.json', 'r') as f:
    existing_artists = json.load(f)

existing_images = set()
existing_artist_ids = set()
for a in existing_artists:
    existing_artist_ids.add(a['id'])
    for w in a['works']:
        if w.get('image'):
            # The image path might be /images/artworks/artist-id/filename.ext
            filename = os.path.basename(w['image'])
            # Store just the filename or a combination of artist-id + filename to be safe
            existing_images.add(f"{a['id']}/{filename}")

new_data = []

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if "Foto OK" in file and not file.startswith('._'):
            image_path = os.path.join(root, file)
            
            # Extract artist name and artwork name from path
            parts = image_path.split(os.sep)
            # parts[0] is base_dir
            # parts[1] is Artist Name
            # parts[2] might be Artwork Name, or if Foto OK is right inside Artist Name, artwork name is "Sin Título"
            
            artist_name = parts[1]
            artist_id = slugify(artist_name)
            
            artwork_folder = parts[2] if len(parts) > 3 else "Sin Título"
            # Some paths are COLECCIÓN/ARTISTA/OBRA/Foto OK.ext
            # Others might be COLECCIÓN/ARTISTA/Foto OK.ext
            
            ext = os.path.splitext(file)[1].lower()
            if not ext: ext = '.png'
            dest_filename = f"{slugify(artwork_folder)}{ext}"
            check_key = f"{artist_id}/{dest_filename}"
            
            if check_key in existing_images:
                continue # Already imported
                
            # Find the word doc for this artist
            artist_dir = os.path.join(base_dir, artist_name)
            docs = glob.glob(os.path.join(artist_dir, "*.doc*"))
            docs = [d for d in docs if not os.path.basename(d).startswith('~')]
            
            bio_text = ""
            if docs:
                doc_path = docs[0]
                try:
                    result = subprocess.run(['textutil', '-convert', 'txt', '-stdout', doc_path], capture_output=True, text=True)
                    bio_text = result.stdout.strip()
                except Exception as e:
                    print(f"Could not read {doc_path}: {e}")
            
            new_data.append({
                "artist_name": artist_name,
                "artist_id": artist_id,
                "artwork_folder": artwork_folder,
                "image_path": image_path,
                "dest_filename": dest_filename,
                "raw_text": bio_text
            })

with open('new_data.json', 'w') as f:
    json.dump(new_data, f, indent=2, ensure_ascii=False)

print(f"Found {len(new_data)} NEW artworks.")
