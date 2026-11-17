import os
import zipfile

dist_dir = r'c:\Users\USER\OneDrive\Desktop\EduLearn\frontend\dist'
desktop_zip = r'c:\Users\USER\OneDrive\Desktop\EduLearn_WebA2Z.zip'
project_zip = r'c:\Users\USER\OneDrive\Desktop\EduLearn\EduLearn_WebA2Z.zip'

# 1. Add index.php companion for Apache/PHP file manager compatibility
with open(os.path.join(dist_dir, 'index.php'), 'w', encoding='utf-8') as f:
    f.write('<?php include_once("index.html"); ?>\n')

# 2. Add .htaccess companion
with open(os.path.join(dist_dir, '.htaccess'), 'w', encoding='utf-8') as f:
    f.write('<IfModule mod_mime.c>\n  AddType application/javascript js mjs\n  AddType text/css css\n</IfModule>\n')

# 3. Create ZIP packages
for zp in [desktop_zip, project_zip]:
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir)
                zf.write(full_path, rel_path)
    print(f"Created: {zp} ({os.path.getsize(zp) / 1024:.1f} KB)")
