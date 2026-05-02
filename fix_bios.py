#!/usr/bin/env python3
"""
Fix bios: Read all biography docx files and update artists.json bios.
Also read ficha técnica for all artists and update artwork metadata.
"""

import json
import os
import re
import docx

COLLECTION_DIR = "/Users/macbookpro/Desktop/PATRIMONIO FAMILIAR/COLECCIÓN LUBE64 ARTE CONTEMPORÁNEO"
ARTISTS_JSON = "/Users/macbookpro/Desktop/PATRIMONIO FAMILIAR/web/src/data/artists.json"

def read_docx(filepath):
    try:
        doc = docx.Document(filepath)
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    except Exception as e:
        print(f"  Error reading {filepath}: {e}")
        return ""

def find_bio_file(directory):
    for f in os.listdir(directory):
        if ('iograf' in f.lower()) and f.endswith('.docx') and not f.startswith('~'):
            return os.path.join(directory, f)
    return None

def find_ficha_files(directory):
    fichas = []
    for f in os.listdir(directory):
        if ('ficha' in f.lower() and ('cnica' in f.lower() or 'tecnica' in f.lower())) and f.endswith('.docx') and not f.startswith('~'):
            fichas.append(os.path.join(directory, f))
    # Also check subdirectories
    for subdir in os.listdir(directory):
        subdir_path = os.path.join(directory, subdir)
        if os.path.isdir(subdir_path):
            for f in os.listdir(subdir_path):
                if ('ficha' in f.lower() and ('cnica' in f.lower() or 'tecnica' in f.lower())) and f.endswith('.docx') and not f.startswith('~'):
                    fichas.append(os.path.join(subdir_path, f))
    return fichas

def find_desc_file(directory):
    """Find description/obra docx files."""
    for f in os.listdir(directory):
        if ('descripci' in f.lower() or 'resumen' in f.lower() or 'vista general' in f.lower()) and f.endswith('.docx') and not f.startswith('~'):
            return os.path.join(directory, f)
    return None

def main():
    with open(ARTISTS_JSON, 'r', encoding='utf-8') as f:
        artists = json.load(f)
    
    updated_count = 0
    
    for artist in artists:
        artist_dir = os.path.join(COLLECTION_DIR, artist['name'])
        if not os.path.isdir(artist_dir):
            continue
        
        # Read biography
        bio_file = find_bio_file(artist_dir)
        if bio_file:
            bio_text = read_docx(bio_file)
            if bio_text and len(bio_text) > 10:
                # Truncate to ~1000 chars at a sentence boundary
                if len(bio_text) > 1000:
                    truncated = bio_text[:1000]
                    last_period = truncated.rfind('.')
                    if last_period > 500:
                        truncated = truncated[:last_period + 1]
                    bio_text = truncated
                artist['bio'] = bio_text
                print(f"✓ {artist['name']}: bio {len(bio_text)} chars")
                updated_count += 1
            else:
                print(f"✗ {artist['name']}: bio empty or too short")
        else:
            print(f"✗ {artist['name']}: no bio file found")
        
        # Read ficha técnica and update artwork metadata
        ficha_files = find_ficha_files(artist_dir)
        for ff in ficha_files:
            ficha_text = read_docx(ff)
            if ficha_text:
                # Try to extract technique, dimensions, year
                for artwork in artist.get('artworks', []):
                    # If artwork is missing technique/dimensions/year, try to fill from ficha
                    if not artwork.get('technique'):
                        m = re.search(r'(?:técnica|tecnica)\s*[:\-]\s*(.+)', ficha_text, re.IGNORECASE)
                        if m:
                            artwork['technique'] = m.group(1).strip().rstrip('.')
                    if not artwork.get('dimensions'):
                        m = re.search(r'(?:dimensiones|medidas|tamaño|formato)\s*[:\-]\s*(.+)', ficha_text, re.IGNORECASE)
                        if m:
                            artwork['dimensions'] = m.group(1).strip().rstrip('.')
                    if not artwork.get('year'):
                        m = re.search(r'(?:año|fecha|datación)\s*[:\-]\s*(\d{4})', ficha_text, re.IGNORECASE)
                        if m:
                            artwork['year'] = m.group(1)
        
        # Also check description files
        desc_file = find_desc_file(artist_dir)
        if desc_file:
            desc_text = read_docx(desc_file)
            if desc_text and not artist.get('bio'):
                if len(desc_text) > 1000:
                    truncated = desc_text[:1000]
                    last_period = truncated.rfind('.')
                    if last_period > 300:
                        truncated = truncated[:last_period + 1]
                    desc_text = truncated
                artist['bio'] = desc_text
    
    # Save
    with open(ARTISTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(artists, f, ensure_ascii=False, indent=2)
    
    print(f"\nDone! Updated {updated_count} artist bios")

if __name__ == "__main__":
    main()
