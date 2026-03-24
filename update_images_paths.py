import re
import os

files = ['index.html', 'proyectos.html']

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # The goal is to replace `images/proyecto*.jpg` with `images/proyectoN/1.jpg` where N is the card number.
    # To do this safely, we iterate over the file line by line and track which card we are in.
    lines = content.split('\n')
    current_card = None
    
    for i, line in enumerate(lines):
        # find <!-- Card N -->
        m = re.search(r'<!-- Card (\d+) -->', line)
        if m:
            current_card = m.group(1)
        
        if current_card:
            # We are inside a card block, up to the closing </a>
            # Replace ANY images/proyectoX.jpg with images/proyecto{current_card}/1.jpg as the PRIMARY image
            # Wait, the data-project-images contains multiple.
            # E.g. data-project-images="images/proyecto1.jpg,images/proyecto2.jpg,images/proyecto3.jpg"
            # It's better to just change the main thumbnail src and the first image in data-project-images to the new folder structure.
            # If the user is going to put multiple images per project, it's easiest if data-project-images just points to 1.jpg for now,
            # or we generate a placeholder data-project-images="images/proyectoN/1.jpg,images/proyectoN/2.jpg,images/proyectoN/3.jpg"
            # Let's do exactly that! This sets them up perfectly to drop multiple images in each folder.
            
            # 1) Replace data-project-images="..." -> data-project-images="images/proyectoN/1.jpg,images/proyectoN/2.jpg,images/proyectoN/3.jpg"
            line = re.sub(r'data-project-images="[^"]+"', f'data-project-images="images/proyecto{current_card}/1.jpg,images/proyecto{current_card}/2.jpg,images/proyecto{current_card}/3.jpg"', line)
            
            # 2) Replace img src="images/proyectoX.jpg" -> img src="images/proyectoN/1.jpg"
            line = re.sub(r'src="images/proyecto\d+\.jpg"', f'src="images/proyecto{current_card}/1.jpg"', line)

            lines[i] = line
            
            if '</a>' in line:
                current_card = None

    # Write back
    with open(file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

print("HTML files updated with subfolder structure!")
