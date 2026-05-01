import json

bios = {
    "antoni-amat": "Antoni Amat (Barcelona, 1949). Artista catalán vinculado a la abstracción lírica y la experimentación matérica. Su obra, resuelta habitualmente en técnica mixta sobre papel, se caracteriza por un gesto expresivo y una paleta contenida que explora las texturas y la huella del proceso creativo. Ha expuesto en galerías de Barcelona y su trabajo forma parte de colecciones privadas en España.",
    "angel-sevillano": "Ángel Sevillano Estremera (Vigo, 1942 - Vilagarcía de Arousa, 1994). Pintor gallego cuya obra abarca el óleo y la acuarela sobre papel, con un estilo expresivo y vibrante. Su producción pictórica, desarrollada durante las décadas de los sesenta a los noventa, refleja una sensibilidad especial por el color y el paisaje gallego, combinando tradición e innovación técnica.",
    "felicidad-moreno": "Felicidad Moreno (Madrid, 1959). Artista plástica española cuya obra se enmarca en la abstracción lírica contemporánea. Trabaja principalmente con técnica mixta sobre papel, creando composiciones de gran expresividad gestual y cromática. Su pintura explora las tensiones entre forma y vacío, luz y materia. Ha expuesto en galerías y centros de arte de Madrid y su obra integra colecciones privadas nacionales."
}

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

for a in artists:
    if a['id'] in bios:
        a['biography'] = bios[a['id']]

with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)

pending = [a['name'] for a in artists if 'pendiente' in a.get('biography','').lower()]
print(f"Pending: {pending if pending else 'NONE - All complete!'}")
print(f"Final: {len(artists)} artists, {sum(len(a['works']) for a in artists)} artworks")
