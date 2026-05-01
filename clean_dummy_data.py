import json

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

# The dummy artists from earlier prototyping were "kepa-garraza", "antonio-murado", "jose-manuel-ciria"
dummy_ids = ["kepa-garraza", "antonio-murado", "jose-manuel-ciria"]

filtered_artists = [a for a in artists if a['id'] not in dummy_ids]

with open('web/src/data/artists.json', 'w') as f:
    json.dump(filtered_artists, f, indent=2, ensure_ascii=False)

print(f"Removed {len(artists) - len(filtered_artists)} dummy artists.")
