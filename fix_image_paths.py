import json
import os

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

for artist in artists:
    for work in artist['works']:
        if work.get('image'):
            # Path in json starts with /, so we prepend web/public
            # e.g. /images/artworks/alain-urrutia/sin-titulo.png -> web/public/images/artworks/...
            # or /artworks/antonio-murado/maranas-salmon.jpg -> web/public/artworks/...
            
            local_path = os.path.join('web/public', work['image'].lstrip('/'))
            if not os.path.exists(local_path):
                print(f"File not found, clearing image: {local_path}")
                work['image'] = ""

with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)

print("Image paths verified and cleaned.")
