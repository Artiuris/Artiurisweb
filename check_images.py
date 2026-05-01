import json

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

for a in artists:
    for w in a['works']:
        print(f"{w['title']}: {w['image']}")
