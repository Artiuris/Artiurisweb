import json

with open('new_data.json', 'r') as f:
    data = json.load(f)

unique_artists = {}
for item in data:
    if item['artist_id'] not in unique_artists:
        unique_artists[item['artist_id']] = {
            'name': item['artist_name'],
            'text': item['raw_text'][:1500] # Give me up to 1500 chars to summarize from
        }

for k, v in unique_artists.items():
    print(f"=== {v['name']} ({k}) ===")
    print(v['text'])
    print()
