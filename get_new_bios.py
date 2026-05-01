import json

new_artists = [
    "cesar-saldivar", "carolina-ferrer", "cecili0-pla-y-gallardo", 
    "eduardo-nave-silvestre", "dario-alvarez-basso", "eduardo-barco",
    "chus-garcia-fraile", "din-matamoro", "daniel-argimon",
    "cristobal-toral", "carmen-garcia-bartolome", "clara-amello",
    "david-zaragoza-gomez", "dominique-vivant-denon", "concha-prada",
    "eduardo-chillida-juantegui", "diego-casado-cerezo"
]

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

for a in artists:
    if a['id'] in new_artists:
        print(f"=== {a['name']} ({a['id']}) ===")
        print(a['biography'][:1500])
        print()
