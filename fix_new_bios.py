import json

bios = {
    "cesar-saldivar": "César Saldívar (Monterrey, México, 1965). Destacado fotógrafo mexicano afincado en España, reconocido como el 'fotógrafo del cine español'. Su lenguaje visual, profundamente honesto, se plasma en fotografías analógicas en blanco y negro, donde destaca la figura al desnudo bajo luz natural. Ha retratado a grandes figuras de la cultura como Pedro Almodóvar o Penélope Cruz, y su obra se expone internacionalmente.",
    "carolina-ferrer": "Carolina Ferrer Juan (Valencia, 1958). Pintora y creadora visual valenciana. Su obra destaca por atmósferas misteriosas, dominadas por verdes ácidos, negros y magentas, aplicando técnicas innovadoras con resina epoxy que otorgan a sus lienzos un carácter casi irreal. Ha expuesto en la Sala Parpalló y su obra reflexiona poéticamente sobre la luz, la memoria y el paso del tiempo.",
    "cecili0-pla-y-gallardo": "Cecilio Pla y Gallardo (Valencia, 1859 - Madrid, 1934). Maestro de la pintura impresionista y luminista española, contemporáneo de Sorolla. Destacó como pintor, ilustrador y académico de San Fernando. Su obra, que abarca el retrato, el costumbrismo y la pintura social, brilla por la maestría en la captación de la luz ('Señoras en la playa'). Su obra figura en el Museo del Prado y el Museo de Bellas Artes de Valencia.",
    "eduardo-nave-silvestre": "Eduardo Nave Silvestre (Valencia, 1976). Reconocido fotógrafo español contemporáneo. Su obra documenta paisajes históricos marcados por el trauma o el paso del tiempo ('Serie Normandie'). Su estilo sereno, poético y reflexivo ha sido galardonado en múltiples certámenes internacionales como PhotoEspaña. Sus fotografías integran importantes colecciones públicas y privadas nacionales e internacionales.",
    "dario-alvarez-basso": "Darío Álvarez Basso (Caracas, 1966). Pintor español de origen venezolano, referente del neoexpresionismo abstracto e informalismo de los 80. Su pintura, matérica y expansiva, se enriquece de influencias orientales y vivencias en Roma, París y Nueva York. Galardonado con prestigiosas becas, su obra forma parte de las colecciones del MNCARS, IVAM y CGAC.",
    "eduardo-barco": "Eduardo Barco (Ciudad Real, 1970). Destacado artista y pintor abstracto español. Su obra explora la geometría, la proporción y el equilibrio cromático, creando composiciones espaciales que rozan el minimalismo y el constructivismo. Ha exhibido su trabajo en numerosas galerías y ferias de arte contemporáneo (ARCO), integrando colecciones como la Fundación Coca-Cola o el Museo Municipal de Madrid.",
    "chus-garcia-fraile": "Chus García-Fraile (Madrid, 1965). Reconocida artista multidisciplinar cuyo trabajo abarca la pintura, la fotografía y la instalación ('Icono'). Su obra es una reflexión crítica sobre el consumismo, la publicidad y el entorno urbano, caracterizada por un hiperrealismo conceptual. Expositora habitual en ARCO y ferias internacionales, su obra pertenece a colecciones como el MNCARS, MUSAC y Fundación La Caixa.",
    "din-matamoro": "Din Matamoro (Vigo, 1958). Pintor gallego imprescindible para entender la abstracción contemporánea en España. Su pintura es un silencioso y poético estudio sobre la luz, la vibración del color y la percepción retiniana. Tras vivir en Nueva York y Roma, consolidó un estilo depurado y minimalista. Ha expuesto en el CGAC y el MARCO, y su obra figura en relevantes colecciones como el MNCARS.",
    "daniel-argimon": "Daniel Argimón (Barcelona, 1929 - 1996). Pintor, grabador y escultor informalista catalán. Pionero en el uso de materiales de desecho (assemblage, collages y técnica mixta sobre tela) durante los años sesenta, su obra está cargada de expresividad dramática y protesta política. Expuso ampliamente en Europa y América. Su obra está representada en el MACBA, MNCARS y múltiples museos de arte moderno.",
    "diego-casado-cerezo": "Diego Casado Cerezo (Sevilla, 1958). Pintor contemporáneo español con una obra fuertemente poética que reflexiona sobre el paisaje, la memoria y el espacio interior ('La casa del alma', 'Espacio oculto'). Su técnica combina el lirismo abstracto con un tratamiento delicado de la materia pictórica y el color. A lo largo de su carrera ha expuesto en diversas galerías nacionales, labrándose un sólido prestigio crítico."
}

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)
    
count = 0
for artist in artists:
    if artist['id'] in bios:
        artist['biography'] = bios[artist['id']]
        count += 1
        
with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)
    
print(f"Rewrote {count} new biographies successfully!")
