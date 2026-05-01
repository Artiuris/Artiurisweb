import json

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

remove_ids = {
    # Diego Casado Cerezo: keep first, remove 3 duplicates
    "diego-casado-cerezo-sin-titulo-1",
    "diego-casado-cerezo-sin-titulo-2",
    "diego-casado-cerezo-sin-titulo-3",
    # Darío Álvarez Basso: keep first of each, remove duplicates
    "dario-alvarez-basso-composiciones-2-acuarelas-1",
    "dario-alvarez-basso-composiciones-acuarelas-1",
    # Eduardo Nave: keep the one with better title, remove duplicate
    "eduardo-nave-silvestre-normandia",  # keep "Restos del puerto militar..." as it's more descriptive
}

removed = 0
for a in artists:
    before = len(a['works'])
    a['works'] = [w for w in a['works'] if w['id'] not in remove_ids]
    removed += before - len(a['works'])

with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)

print(f"Removed {removed} duplicate artworks.")
print(f"Final: {len(artists)} artists, {sum(len(a['works']) for a in artists)} artworks")
