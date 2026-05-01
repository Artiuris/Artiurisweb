import json

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

for a in artists:
    print(f"{a['name']}: {len(a['biography'])} chars")
