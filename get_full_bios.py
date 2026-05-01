import os
import json
import subprocess

base_dir = "./COLECCIÓN LUBE64 ARTE CONTEMPORÁNEO"
bios = {}

def extract_text(file_path):
    try:
        result = subprocess.run(['textutil', '-convert', 'txt', file_path, '-stdout'], capture_output=True, text=True)
        return result.stdout.strip()
    except Exception as e:
        return ""

for root, dirs, files in os.walk(base_dir):
    for a_file in files:
        if "biograf" in a_file.lower() and a_file.endswith(('.doc', '.docx')) and not a_file.startswith('~$'):
            bio_path = os.path.join(root, a_file)
            # The artist name is the folder name
            artist_name = os.path.basename(root)
            full_text = extract_text(bio_path)
            bios[artist_name] = full_text

with open('full_bios.json', 'w') as f:
    json.dump(bios, f, indent=2, ensure_ascii=False)

print(f"Extracted {len(bios)} full biographies.")
