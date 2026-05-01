import json

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

with open('full_bios.json', 'r') as f:
    full_bios = json.load(f)

relevant_bios = {}
for a in artists:
    name = a['name']
    # Sometimes names in full_bios match the directory exactly.
    # The get_full_bios.py extracted based on directory name.
    # We can match ignoring case
    for k, v in full_bios.items():
        if name.lower() in k.lower() or k.lower() in name.lower():
            relevant_bios[name] = v
            break

with open('relevant_bios.json', 'w') as f:
    json.dump(relevant_bios, f, indent=2, ensure_ascii=False)

print(f"Found {len(relevant_bios)} relevant bios.")
