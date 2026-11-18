import os
import zipfile

dist_dir = r'c:\Users\USER\OneDrive\Desktop\EduLearn\frontend\dist'
assets_dir = os.path.join(dist_dir, 'assets')
desktop_prj_zip = r'c:\Users\USER\OneDrive\Desktop\PRJ135.zip'
project_prj_zip = r'c:\Users\USER\OneDrive\Desktop\EduLearn\PRJ135.zip'
desktop_edulearn_zip = r'c:\Users\USER\OneDrive\Desktop\EduLearn.zip'
project_edulearn_zip = r'c:\Users\USER\OneDrive\Desktop\EduLearn\EduLearn.zip'

# Find the CSS and JS files in assets
css_file = next((f for f in os.listdir(assets_dir) if f.endswith('.css')), None)
js_file = next((f for f in os.listdir(assets_dir) if f.endswith('.js')), None)

with open(os.path.join(assets_dir, css_file), 'r', encoding='utf-8') as f:
    css_content = f.read()

with open(os.path.join(assets_dir, js_file), 'r', encoding='utf-8') as f:
    js_content = f.read()

storage_polyfill = """    <script>
    (function() {
      window.__accessed_mem = window.__accessed_mem || {};
      function createStore() {
        return {
          getItem: function(k) { return Object.prototype.hasOwnProperty.call(window.__accessed_mem, k) ? window.__accessed_mem[k] : null; },
          setItem: function(k, v) { window.__accessed_mem[k] = String(v); },
          removeItem: function(k) { delete window.__accessed_mem[k]; },
          clear: function() { window.__accessed_mem = {}; },
          get length() { return Object.keys(window.__accessed_mem).length; },
          key: function(i) { return Object.keys(window.__accessed_mem)[i] || null; }
        };
      }
      try {
        var t = window.localStorage;
        t.setItem('__t_test', '1');
        t.removeItem('__t_test');
      } catch(e) {
        try {
          Object.defineProperty(window, 'localStorage', { value: createStore(), configurable: true, writable: true });
        } catch(e2) {
          window.localStorage = createStore();
        }
      }
      try {
        var s = window.sessionStorage;
        s.setItem('__t_test', '1');
        s.removeItem('__t_test');
      } catch(e) {
        try {
          Object.defineProperty(window, 'sessionStorage', { value: createStore(), configurable: true, writable: true });
        } catch(e2) {
          window.sessionStorage = createStore();
        }
      }
    })();
    </script>"""

html_content = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="AccessEd is an accessibility-first inclusive learning ecosystem that adapts educational content across visual, auditory, and cognitive modes." />
    <meta name="theme-color" content="#090d16" />
    <title>AccessEd — Inclusive Learning & Multimodal Accessibility Ecosystem</title>
{storage_polyfill}
    <style>
{css_content}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
{js_content}
    </script>
  </body>
</html>"""

# Write self-contained index.html
with open(os.path.join(dist_dir, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(html_content)

# Write index.php
with open(os.path.join(dist_dir, 'index.php'), 'w', encoding='utf-8') as f:
    f.write(html_content)

# Write .htaccess
with open(os.path.join(dist_dir, '.htaccess'), 'w', encoding='utf-8') as f:
    f.write("<IfModule mod_mime.c>\n  AddType application/javascript js mjs\n  AddType text/css css\n</IfModule>\n")

# Package into PRJ135.zip and EduLearn.zip
packages = [
    desktop_prj_zip,
    project_prj_zip,
    desktop_edulearn_zip,
    project_edulearn_zip
]

for zp in packages:
    if os.path.exists(zp):
        try:
            os.remove(zp)
        except Exception:
            pass
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir)
                zf.write(full_path, rel_path)
    print(f"Created package: {zp} ({os.path.getsize(zp) / 1024:.1f} KB)")
