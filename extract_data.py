import os
import json
import subprocess

base_dir = "./COLECCIÓN LUBE64 ARTE CONTEMPORÁNEO"
results = []

def extract_text(file_path):
    try:
        result = subprocess.run(['textutil', '-convert', 'txt', file_path, '-stdout'], capture_output=True, text=True)
        return result.stdout.strip()
    except Exception as e:
        return ""

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if "foto ok" in file.lower() and not file.startswith('._'):
            img_path = os.path.join(root, file)
            # path parts
            rel_path = os.path.relpath(img_path, base_dir)
            parts = rel_path.split(os.sep)
            
            if len(parts) == 2:
                # Artist/Foto OK.png
                artist = parts[0]
                artwork = "Sin Título"
                artist_dir = root
            elif len(parts) >= 3:
                # Artist/Artwork/Foto OK.png
                artist = parts[0]
                artwork = parts[1]
                artist_dir = os.path.join(base_dir, artist)
            else:
                continue
                
            # Find biography in artist_dir
            bio_text = ""
            if os.path.isdir(artist_dir):
                for a_file in os.listdir(artist_dir):
                    if "biograf" in a_file.lower() and a_file.endswith(('.doc', '.docx')) and not a_file.startswith('~$'):
                        bio_path = os.path.join(artist_dir, a_file)
                        bio_text = extract_text(bio_path)
                        break
            
            results.append({
                "artist": artist,
                "artwork": artwork,
                "image_path": img_path,
                "bio_text": bio_text[:1000] + "..." if len(bio_text) > 1000 else bio_text
            })

with open("extracted_data.json", "w") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Extracted {len(results)} artworks.")
