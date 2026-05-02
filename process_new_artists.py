#!/usr/bin/env python3
"""
Script to process new artists from the collection directory.
- Reads biography .docx files
- Reads technical sheet .docx files
- Finds Foto OK images
- Generates entries for artists.json
"""

import json
import os
import re
import shutil
import glob
from pathlib import Path

try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False
    print("WARNING: python-docx not installed")

COLLECTION_DIR = "/Users/macbookpro/Desktop/PATRIMONIO FAMILIAR/COLECCIÓN LUBE64 ARTE CONTEMPORÁNEO"
ARTISTS_JSON = "/Users/macbookpro/Desktop/PATRIMONIO FAMILIAR/web/src/data/artists.json"
IMAGES_DIR = "/Users/macbookpro/Desktop/PATRIMONIO FAMILIAR/web/public/images/artworks"

def read_docx(filepath):
    """Read text from a .docx file."""
    if not HAS_DOCX:
        return ""
    try:
        doc = docx.Document(filepath)
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    except Exception as e:
        print(f"  Error reading {filepath}: {e}")
        return ""

def find_file_case_insensitive(directory, pattern):
    """Find a file matching pattern case-insensitively."""
    for f in os.listdir(directory):
        if pattern.lower() in f.lower():
            return os.path.join(directory, f)
    return None

def slugify(text):
    """Create a URL-friendly slug."""
    text = text.lower().strip()
    text = text.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
    text = text.replace("ñ", "n").replace("ü", "u").replace("à", "a").replace("è", "e")
    text = text.replace("ç", "c").replace("ï", "i").replace("ö", "o")
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def parse_ficha_tecnica(text):
    """Extract metadata from a technical sheet text."""
    info = {}
    text_lower = text.lower()
    
    # Title
    for pattern in [r'(?:título|titulo)\s*[:\-]\s*(.+)', r'(?:obra)\s*[:\-]\s*(.+)']:
        m = re.search(pattern, text_lower)
        if m:
            info['title'] = m.group(1).strip().strip('"').strip("'")
            break
    
    # Technique
    for pattern in [r'(?:técnica|tecnica)\s*[:\-]\s*(.+)', r'(?:soporte)\s*[:\-]\s*(.+)']:
        m = re.search(pattern, text_lower)
        if m:
            info['technique'] = m.group(1).strip()
            break
    
    # Dimensions
    for pattern in [r'(?:dimensiones|medidas|tamaño|formato)\s*[:\-]\s*(.+)', r'(\d+\s*[xX×]\s*\d+\s*(?:cm|mm)?)']:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            info['dimensions'] = m.group(1).strip()
            break
    
    # Year
    for pattern in [r'(?:año|fecha|datación)\s*[:\-]\s*(\d{4})', r'\b((?:19|20)\d{2})\b']:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            info['year'] = m.group(1)
            break
    
    # Edition
    m = re.search(r'(?:edición|tirada|ejemplar)\s*[:\-]\s*(.+)', text, re.IGNORECASE)
    if m:
        info['edition'] = m.group(1).strip()
    
    # Signature
    m = re.search(r'(?:firma|firmado)\s*[:\-]\s*(.+)', text, re.IGNORECASE)
    if m:
        info['signature'] = m.group(1).strip()
    
    return info

def find_foto_ok_files(directory):
    """Find all Foto OK files in a directory recursively."""
    photos = []
    for root, dirs, files in os.walk(directory):
        for f in files:
            if f.lower().startswith("foto ok") and not f.startswith("~") and not f.startswith("."):
                full_path = os.path.join(root, f)
                # Determine relative context (subfolder name = artwork name)
                rel = os.path.relpath(root, directory)
                photos.append({
                    'path': full_path,
                    'filename': f,
                    'context': rel if rel != '.' else '',
                    'extension': os.path.splitext(f)[1].lower()
                })
    return photos

def process_artist(artist_name, artist_dir):
    """Process a single artist directory and return an artist dict."""
    print(f"\nProcessing: {artist_name}")
    
    # Read biography
    bio_text = ""
    bio_file = find_file_case_insensitive(artist_dir, "biografía del artista")
    if not bio_file:
        bio_file = find_file_case_insensitive(artist_dir, "biografia del artista")
    if not bio_file:
        bio_file = find_file_case_insensitive(artist_dir, "biografía resumida")
    if not bio_file:
        bio_file = find_file_case_insensitive(artist_dir, "biografia resumida")
    if bio_file and bio_file.endswith('.docx') and not os.path.basename(bio_file).startswith('~'):
        bio_text = read_docx(bio_file)
        print(f"  Bio: {len(bio_text)} chars")
    
    # Find ficha técnica files
    ficha_files = []
    for f in os.listdir(artist_dir):
        if ('ficha' in f.lower() and 'cnica' in f.lower()) and f.endswith('.docx') and not f.startswith('~'):
            ficha_files.append(os.path.join(artist_dir, f))
    
    # Also check subdirectories for ficha técnica
    for subdir in os.listdir(artist_dir):
        subdir_path = os.path.join(artist_dir, subdir)
        if os.path.isdir(subdir_path):
            for f in os.listdir(subdir_path):
                if ('ficha' in f.lower() and 'cnica' in f.lower()) and f.endswith('.docx') and not f.startswith('~'):
                    ficha_files.append(os.path.join(subdir_path, f))
    
    # Read ficha técnica
    ficha_text = ""
    ficha_info = {}
    for ff in ficha_files:
        txt = read_docx(ff)
        if txt:
            ficha_text += "\n" + txt
            info = parse_ficha_tecnica(txt)
            if info:
                ficha_info.update(info)
                print(f"  Ficha: {info}")
    
    # Find Foto OK files
    photos = find_foto_ok_files(artist_dir)
    print(f"  Photos: {len(photos)}")
    
    # Build artworks
    artworks = []
    
    # Group photos by context (subfolder)
    photo_groups = {}
    root_photos = []
    for p in photos:
        if p['context'] and p['context'] != '.':
            ctx = p['context'].split('/')[0]  # Top-level subfolder only
            if ctx not in photo_groups:
                photo_groups[ctx] = []
            photo_groups[ctx].append(p)
        else:
            root_photos.append(p)
    
    if photo_groups:
        # Multiple artworks in subfolders
        for ctx, ctx_photos in photo_groups.items():
            # Try to read ficha técnica from the subfolder
            subfolder_path = os.path.join(artist_dir, ctx)
            sub_ficha_info = {}
            if os.path.isdir(subfolder_path):
                for f in os.listdir(subfolder_path):
                    if ('ficha' in f.lower() and 'cnica' in f.lower()) and f.endswith('.docx') and not f.startswith('~'):
                        txt = read_docx(os.path.join(subfolder_path, f))
                        sub_ficha_info = parse_ficha_tecnica(txt)
            
            # Parse title and technique from folder name
            folder_parts = ctx.split(' - ')
            title = folder_parts[0].strip()
            # Remove leading numbers like "1 - ", "19 - " 
            title_clean = re.sub(r'^\d+\s*-\s*', '', title).strip()
            if not title_clean:
                title_clean = title
            technique = folder_parts[1].strip() if len(folder_parts) > 1 else sub_ficha_info.get('technique', '')
            
            # Sort photos: Foto OK first, then N2, N3, etc.
            ctx_photos.sort(key=lambda p: p['filename'])
            
            # Copy photos and build image paths
            images = []
            for i, photo in enumerate(ctx_photos):
                ext = photo['extension']
                if ext == '.jfif':
                    ext = '.jpg'
                artwork_slug = slugify(f"{artist_name} {title_clean}")
                if i == 0:
                    dest_filename = f"{artwork_slug}{ext}"
                else:
                    dest_filename = f"{artwork_slug}-{i+1}{ext}"
                
                dest_path = os.path.join(IMAGES_DIR, dest_filename)
                if not os.path.exists(dest_path):
                    shutil.copy2(photo['path'], dest_path)
                    print(f"  Copied: {dest_filename}")
                images.append(f"/images/artworks/{dest_filename}")
            
            if images:
                artwork = {
                    "title": sub_ficha_info.get('title', title_clean),
                    "image": images[0],
                    "additionalImages": images[1:] if len(images) > 1 else [],
                    "technique": technique or sub_ficha_info.get('technique', ''),
                    "dimensions": sub_ficha_info.get('dimensions', ''),
                    "year": sub_ficha_info.get('year', ''),
                }
                # Clean up empty fields
                artwork = {k: v for k, v in artwork.items() if v or k in ['title', 'image']}
                artworks.append(artwork)
    
    if root_photos:
        # Single artwork or photos at root level
        # Sort: Foto OK first, then N2, N3, etc.
        root_photos.sort(key=lambda p: p['filename'])
        
        images = []
        title = ficha_info.get('title', 'Sin título')
        artwork_slug = slugify(f"{artist_name} {title}")
        
        for i, photo in enumerate(root_photos):
            ext = photo['extension']
            if ext == '.jfif':
                ext = '.jpg'
            if i == 0:
                dest_filename = f"{artwork_slug}{ext}"
            else:
                dest_filename = f"{artwork_slug}-{i+1}{ext}"
            
            dest_path = os.path.join(IMAGES_DIR, dest_filename)
            if not os.path.exists(dest_path):
                shutil.copy2(photo['path'], dest_path)
                print(f"  Copied: {dest_filename}")
            images.append(f"/images/artworks/{dest_filename}")
        
        if images:
            artwork = {
                "title": title,
                "image": images[0],
                "additionalImages": images[1:] if len(images) > 1 else [],
                "technique": ficha_info.get('technique', ''),
                "dimensions": ficha_info.get('dimensions', ''),
                "year": ficha_info.get('year', ''),
            }
            artwork = {k: v for k, v in artwork.items() if v or k in ['title', 'image']}
            artworks.append(artwork)
    
    # Build artist entry
    artist_id = slugify(artist_name)
    
    artist_entry = {
        "id": artist_id,
        "name": artist_name,
        "bio": bio_text[:1000] if bio_text else "",
        "artworks": artworks,
    }
    
    if ficha_text:
        artist_entry["fichaText"] = ficha_text[:2000]
    
    return artist_entry

def main():
    # Load existing artists
    with open(ARTISTS_JSON, 'r', encoding='utf-8') as f:
        existing_artists = json.load(f)
    
    existing_names = {a['name'] for a in existing_artists}
    print(f"Existing artists: {len(existing_names)}")
    
    # Get all artist folders
    all_folders = sorted(os.listdir(COLLECTION_DIR))
    new_artists = [f for f in all_folders if f not in existing_names and os.path.isdir(os.path.join(COLLECTION_DIR, f))]
    print(f"New artists to process: {len(new_artists)}")
    
    # Also check existing artists for updated photos
    updated_existing = []
    
    # Process new artists
    new_entries = []
    for artist_name in new_artists:
        artist_dir = os.path.join(COLLECTION_DIR, artist_name)
        if not os.path.isdir(artist_dir):
            continue
        entry = process_artist(artist_name, artist_dir)
        if entry:
            new_entries.append(entry)
    
    # Also rescan existing artists for new/changed photos
    print("\n\n=== Checking existing artists for changes ===")
    for artist in existing_artists:
        artist_dir = os.path.join(COLLECTION_DIR, artist['name'])
        if not os.path.isdir(artist_dir):
            continue
        
        photos = find_foto_ok_files(artist_dir)
        current_images = set()
        for aw in artist.get('artworks', []):
            current_images.add(aw.get('image', ''))
            for ai in aw.get('additionalImages', []):
                current_images.add(ai)
        
        # Check if there are new photos not yet in the artworks
        new_photo_count = 0
        for p in photos:
            # Check if any artwork references this photo's destination
            artist_slug = slugify(artist['name'])
            # Simple check: if we have more photos than artwork images
            new_photo_count += 1
        
        existing_image_count = sum(1 + len(aw.get('additionalImages', [])) for aw in artist.get('artworks', []))
        
        if new_photo_count > existing_image_count:
            print(f"  {artist['name']}: {new_photo_count} photos found, {existing_image_count} in JSON - NEEDS UPDATE")
            # Re-process this artist  
            entry = process_artist(artist['name'], artist_dir)
            if entry and entry.get('artworks'):
                # Merge: keep existing bio if new one is empty, keep existing artworks data but add new ones
                # For simplicity, if there are more photos, rebuild the artist's artworks
                updated_existing.append(entry)
    
    # Merge
    # Update existing artists with new data
    for updated in updated_existing:
        for i, existing in enumerate(existing_artists):
            if existing['name'] == updated['name']:
                # Keep existing bio if we don't have a new one
                if not updated.get('bio') and existing.get('bio'):
                    updated['bio'] = existing['bio']
                # Replace artworks with the fuller set
                if len(updated.get('artworks', [])) > len(existing.get('artworks', [])):
                    existing_artists[i]['artworks'] = updated['artworks']
                    print(f"  Updated artworks for {updated['name']}")
                break
    
    # Add new artists
    existing_artists.extend(new_entries)
    
    # Sort by name
    existing_artists.sort(key=lambda a: a['name'])
    
    # Save
    with open(ARTISTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(existing_artists, f, ensure_ascii=False, indent=2)
    
    print(f"\n\nDone! Total artists: {len(existing_artists)}")
    print(f"New artists added: {len(new_entries)}")
    print(f"Existing artists updated: {len(updated_existing)}")

if __name__ == "__main__":
    main()
