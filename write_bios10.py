import json

bios = {
    "jose-otero-abeledo-l-a-x-e-i-r-o": "José Otero Abeledo 'Laxeiro' (Lalín, 1908 - Vigo, 1996). Figura clave de la vanguardia artística gallega junto a Seoane, Colmeiro y Maside. Casi autodidacta, emigró a Cuba y Buenos Aires, donde desarrolló el grueso de su carrera. Su pintura fusiona modernidad y tradición, con un folklorismo esperpéntico cargado de ironía y fantasía. Galardonado con la Medalla Castelao y la Medalla de Oro de Vigo. Cuenta con Fundación propia y representación en todos los museos de Galicia.",
    "jose-manuel-ballester": "José Manuel Ballester (Madrid, 1960). Pintor y fotógrafo, Premio Nacional de Fotografía (2010). Su obra explora la arquitectura, el espacio vacío y la luz como protagonistas silenciosos. Formado en Bellas Artes (UCM) y becado en Roma, sus fotografías de gran formato reinterpretan obras maestras de la pintura eliminando las figuras humanas. Ha expuesto en el MNCARS, IVAM, Museo Thyssen y en ferias como ARCO y Art Basel.",
    "jose-artiaga": "José Artiaga. Artista contemporáneo español cuya obra pictórica se enmarca en una exploración personal de la abstracción y la materia. Su trabajo destaca por la intensidad cromática y una gestualidad contenida que dialoga con la tradición expresionista española. Ha participado en diversas muestras colectivas e individuales en galerías nacionales.",
    "jose-noguero": "José Noguero. Artista visual contemporáneo español. Su obra explora las tensiones entre figuración y abstracción a través de un lenguaje pictórico personal y depurado. Su producción destaca por la sutileza compositiva y el uso expresivo del color, consolidando una trayectoria reconocida en el circuito de galerías de arte contemporáneo.",
    "jorge-perianes": "Jorge Perianes (Orense, 1974). Artista multidisciplinar gallego cuya obra abarca escultura, instalación, dibujo y vídeo. Su trabajo, de marcado carácter conceptual y poético, reflexiona sobre la fragilidad de las estructuras humanas y la relación con la naturaleza. Ha expuesto en el CGAC, MARCO de Vigo, Centro Huarte y en bienales internacionales. Su obra pertenece a colecciones como el MUSAC y la Fundación RAC.",
    "joan-cabrer": "Joan Cabrer (Mallorca). Artista mallorquín cuya obra pictórica se caracteriza por un uso audaz del color y la gestualidad. Su pintura, entre la figuración expresionista y la abstracción lírica, refleja la luz y el paisaje mediterráneo tamizados por una sensibilidad contemporánea. Ha expuesto en galerías de Baleares y la península.",
    "jose-luis-cremades": "José Luis Cremades. Pintor contemporáneo español. Su obra, resuelta principalmente en acrílico sobre lienzo, se mueve entre la abstracción geométrica y una paleta cromática vibrante. Sus composiciones equilibran rigor formal y expresividad, creando atmósferas contemplativas de gran impacto visual. Ha expuesto en galerías y centros de arte nacionales.",
    "jorge-castillo-casalderrey": "Jorge Castillo (Pontevedra, 1933). Figura capital del arte contemporáneo español. Autodidacta, emigró a Buenos Aires donde inició su carrera. Desde los años 60 expone internacionalmente en París, Nueva York y Berlín. Su estilo, de una figuración onírica y expresionista, abarca pintura, dibujo, grabado y escultura. Ha expuesto en el MoMA, Fundación Miró y el CGAC. Su obra pertenece al MNCARS, Guggenheim y múltiples museos europeos.",
    "jose-maria-diaz-maroto": "José María Díaz-Maroto (Madrid, 1957). Fotógrafo artístico español especializado en la captación del paisaje urbano y la arquitectura con un lenguaje poético y documental. Sus series sobre La Habana ('Malecón', 'Parque Central', 'Habana Vieja') destacan por su composición serena y la textura del papel baritado. Sus fotografías, en ediciones limitadas, se encuentran en colecciones privadas nacionales e internacionales.",
    "jose-manuel-ciria": "José Manuel Ciria (Manchester, 1960). Figura central de la pintura abstracta española contemporánea. Becado en París y Roma, su obra es una constante investigación sobre el gesto, el color y la mancha. Ha expuesto en la Galería Tretyakov (Moscú), el IVAM, el Museo Nacional de Buenos Aires y el Museo de Arte de Chile. Galardonado con la Medalla de Oro de la V Bienal de El Cairo, su producción integra las más importantes colecciones internacionales."
}

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)
count = 0
for a in artists:
    if a['id'] in bios:
        a['biography'] = bios[a['id']]
        count += 1
with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)
pending = [a['name'] for a in artists if 'pendiente' in a.get('biography','').lower()]
print(f"Wrote {count} bios. Pending: {pending if pending else 'NONE!'}")
print(f"Final: {len(artists)} artists, {sum(len(a['works']) for a in artists)} works")
