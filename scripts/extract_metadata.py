import os
import re

directory = r"f:\VGP WEB\content\music-production-intelligence-100\01-songwriting-intelligence"
files = sorted([f for f in os.listdir(directory) if f.endswith(".md")])

for file in files:
    path = os.path.join(directory, file)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    title_match = re.search(r"^Title:\s*(.*)$", content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "No Title"
    
    id_match = re.search(r"^Content ID:\s*(.*)$", content, re.MULTILINE)
    content_id = id_match.group(1).strip() if id_match else "No ID"

    desc_match = re.search(r"^Description:\s*(.*)$", content, re.MULTILINE)
    description = desc_match.group(1).strip() if desc_match else ""

    keyword_match = re.search(r"^Primary keyword:\s*(.*)$", content, re.MULTILINE)
    keyword = keyword_match.group(1).strip() if keyword_match else ""

    science_match = re.search(r"^Science anchor:\s*(.*)$", content, re.MULTILINE)
    science = science_match.group(1).strip() if science_match else ""

    art_match = re.search(r"^Art and taste anchor:\s*(.*)$", content, re.MULTILINE)
    art = art_match.group(1).strip() if art_match else ""
    
    # Extract sources section
    sources_section = ""
    sources_match = re.search(r"## Sources\n(.*?)(?=\n##|$)", content, re.DOTALL)
    if sources_match:
        sources_section = sources_match.group(1).strip()
        
    print(f"=== {file} (ID: {content_id}) ===")
    print(f"Title: {title}")
    print(f"Keyword: {keyword}")
    print(f"Science: {science}")
    print(f"Art: {art}")
    print(f"Sources:\n{sources_section}\n")
