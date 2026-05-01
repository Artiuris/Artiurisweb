import json

summaries = {
    "Kepa Garraza": "Comienza su carrera en 2004 ganando premios que le permiten exponer nacional e internacionalmente (Nueva York, Beijing, Roma). Su obra, marcadamente irónica y reflexiva sobre el poder y el arte, está en colecciones del Artium y Museo Patio Herreriano. Destacan sus series \"POWER\", \"RIOT\" y \"B.I.D.A.\". Ha sido galardonado con becas de la Fundación BilbaoArte y el MA Studio de Beijing.",
    "Antonio Murado": "Pintor (Lugo, 1964) de gran proyección internacional residente en Nueva York. Sus obras se agrupan en series donde prevalece el ejercicio tradicional de la pintura y los problemas de percepción, anulando la tridimensionalidad con un pulso de romanticismo europeo. Su obra figura en importantes colecciones como el CGAC, Patrimonio Nacional, AXA Collection y Chase Manhattan Bank.",
    "ALAIN URRUTIA": "Licenciado en Bellas Artes por la UPV, reside en Londres. Disfrutó de la Beca del Museo Solomon Guggenheim de Nueva York (2016). Su obra pictórica se basa en reinterpretar imágenes, habitualmente en blanco y negro, explorando la memoria, la sombra y el encuadre. Ha expuesto en el Boston Center for the Arts, Artium y en la conmemoración del 15 Aniversario del Museo Guggenheim Bilbao.",
    "ALBERTO SALVÁN": "Fotógrafo madrileño (1979) con destacada trayectoria. Ganador del Premio \"FOAM TALENTS\" en 2011 y seleccionado en Descubrimientos PhotoEspaña. Su obra, que incluye series reflexivas sobre el paisaje y el entorno urbano como \"Cars and Houses\", forma parte de colecciones institucionales. Ha expuesto en el Museo de Fotografía de Amsterdam y ferias como Rencontres d'Arles y MadridFoto.",
    "ALFONSO COSTA BEIRO": "Destacado pintor gallego (Noia, 1943) de expresionismo lírico con ecos de Francis Bacon y el cubismo. Sus figuras, de incontenible dinámica y paleta evanescente, se inscriben en fondos luminosos. Becado por la Fundación March en 1972, tiene gran proyección internacional. Ha realizado grandes murales y su obra figura en museos de Arte Moderno, la Fundación March y el Congreso de los Diputados.",
    "ALICIA MARTÍN": "Artista multidisciplinar (Madrid, 1964) que destaca en la escultura e instalación. Su seña de identidad es el uso de libros como elemento escultórico y simbólico, por lo que ganó el Premio Antonio de Sancha 2019. Ha realizado intervenciones específicas globales y expuesto en el Thyssen-Bornemisza. Sus obras integran colecciones del MNCARS, CGAC, IVAM y la Biblioteca de Alejandría.",
    "AMAYA GONZÁLEZ REYES": "Artista interdisciplinar (Sanxenxo, 1979) formada en Arteleku, Museo Serralves y LABoral Escena. Recibió la Beca de la Fundación Laxeiro y ha expuesto en el CGAC y MARCO, además de en ferias internacionales (ARCO, FIAC, The Armory Show). Su obra desarrolla reflexiones conceptuales y críticas con toques de humor sobre el proceso de creación y el propio mercado del arte.",
    "ALBERTO REGUERA": "Pintor abstracto (Segovia, 1961) formado en París. Famoso por sus \"instalaciones pictóricas\" expansivas tridimensionales que saltan del lienzo al espacio. Su obra ha logrado gran impacto en Asia, con muestras en Hong Kong y Singapur. Ha expuesto en el Museo Thyssen-Bornemisza y el Louvre, fusionando materia pictórica y entorno arquitectónico. Su trabajo figura en Patrimonio Nacional.",
    "ALEJANDRO CARRO": "Pintor (Lugo, 1964) y profesor en diversas Escuelas de Arte en Galicia. Su pintura es minuciosa y está cargada de misterio, combinando expresiones informalistas con imágenes concretas que inscribe en espacios irreales, envejeciéndolas para reflejar el paso del tiempo. Ha expuesto en la Casa de Galicia y Nueva York, con obra en la Xunta de Galicia y el Museo Provincial de Lugo.",
    "AITOR ORTIZ": "Destacado fotógrafo internacional (Bilbao, 1971) que investiga el espacio arquitectónico, la luz y la percepción. Documentó la construcción del Museo Guggenheim Bilbao. Ganador del Premio Villa de Madrid y del Gran Premio en la Bienal de Alejandría. Ha publicado monografías en Hatje Cantz y expuesto en Art Basel y Paris Photo. Su obra nutre el MNCARS, IVAM y Fundación Telefónica.",
    "ANA FERNÁNDEZ": "Artista e investigadora (A Coruña, 1968), Licenciada en Bellas Artes por la Universidad de Castilla-La Mancha. Fue becada por la Universidad de Plymouth (Erasmus) y obtuvo la prestigiosa Beca de la Fundación Marcelino Botín (1999/2000). Ha desarrollado una carrera vinculada a la teoría fotográfica, impartiendo conferencias sobre la experiencia creadora y la fotografía como arte.",
    "ALMUDENA FERNÁNDEZ FARIÑA": "Doctora en Bellas Artes y docente universitaria (Vigo, 1970). Su labor combina certeramente investigación y creación plástica. Reconocida con el Premio Francisco de Goya y Premio L'Oreal (2000). Sus proyectos site-specific y pictóricos se expanden más allá del formato tradicional, explorando el espacio expositivo en lugares como el MARCO y el CGAC, formando parte de sus colecciones.",
    "ALBERTO SCHOMMER": "Fotógrafo histórico y clave de la vanguardia española (Vitoria, 1928 - 2015). Premio Nacional de Fotografía 2013 y Académico de Bellas Artes. Creador de los icónicos \"Retratos psicológicos\" de la Transición, y pionero de las voluminosas \"Cascografías\". Con un inmenso legado periodístico y artístico, su trabajo ha sido exhibido en el Centro Pompidou y el Museo del Prado.",
    "ALFONSO ABELENDA ESCUDERO": "Pintor, arquitecto y humorista gráfico gallego (1931-2019) de talento precoz e irónico colaborador de \"La Codorniz\". Su pintura de raíz goyesca y tono expresionista ofrece gran belleza formal, dinamismo y paleta cálida. Viajero incansable, exhibió en capitales europeas y latinoamericanas, consolidando una obra irrepetible presente en múltiples museos e instituciones de Galicia.",
    "ÁLVARO NEGRO": "Pintor conceptual (Lalín, 1973) formado en la Universidad de Vigo y Central Saint Martins de Londres. Adscrito al informalismo geométrico, su estética se plasma en superficies amplias y serenas (a menudo negros y azules) de gran depuración formal. Ha expuesto en el CGAC, Instituto Cervantes de Nápoles y Carpe Diem de Lisboa. Sus obras enriquecen las colecciones del CGAC y MACUF."
}

with open('web/src/data/artists.json', 'r') as f:
    artists = json.load(f)

for a in artists:
    name = a['name']
    # Match name
    for k, v in summaries.items():
        if name.lower() in k.lower() or k.lower() in name.lower():
            a['biography'] = v
            break

with open('web/src/data/artists.json', 'w') as f:
    json.dump(artists, f, indent=2, ensure_ascii=False)

print("Biographies summarized and updated successfully.")
