import json, os, hashlib

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

# 1. Check for duplicate image paths (exact same file referenced twice)
all_images = []
for a in artists:
    for w in a['works']:
        img = w.get('image', '')
        all_images.append((a['name'], w['id'], w['title'], img))

# Group by image path
from collections import defaultdict
by_path = defaultdict(list)
for name, wid, title, img in all_images:
    if img:
        by_path[img].append((name, wid, title))

print("=== DUPLICATE IMAGE PATHS ===")
for path, entries in by_path.items():
    if len(entries) > 1:
        print(f"  {path}")
        for name, wid, title in entries:
            print(f"    -> {name} / {wid} / {title}")

# 2. Check for duplicate image file hashes (different paths but same actual file)
print("\n=== DUPLICATE FILE HASHES ===")
hash_map = defaultdict(list)
for name, wid, title, img in all_images:
    if not img: continue
    full_path = os.path.join('web/public', img.lstrip('/'))
    if os.path.exists(full_path):
        h = hashlib.md5(open(full_path, 'rb').read()).hexdigest()
        hash_map[h].append((name, wid, title, img))

for h, entries in hash_map.items():
    if len(entries) > 1:
        print(f"  Hash {h[:10]}...")
        for name, wid, title, img in entries:
            print(f"    -> {name} / {wid} / '{title}' / {img}")
