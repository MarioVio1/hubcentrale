"""Migrate all 7 apps into unified Next.js app structure.
Structure: src/app/(sections)/{section}/{app,lib,components,etc...}
Imports: @/component/ui/* → keep, @/lib/* → @section/lib/*, etc.
"""
import os, shutil, re

APPS = ['multimedia','cosmetica','libri','lunastar','manga','pokemon','livetv']
BASE = os.path.dirname(os.path.abspath(__file__))

SHARED_PREFIXES = ['components/ui/', 'lib/utils']

def rewrite_file(fp, section):
    with open(fp) as fh:
        content = fh.read()
    changed = False
    result = []
    i = 0
    while i < len(content):
        idx = content.find('@/', i)
        if idx == -1:
            result.append(content[i:])
            break
        result.append(content[i:idx])
        if idx > 0 and content[idx-1] in '"\'':
            quote = content[idx-1]
            path_start = idx + 2
            path_end = path_start
            while path_end < len(content) and content[path_end] != quote:
                path_end += 1
            path = content[path_start:path_end]
            if any(path.startswith(p) for p in SHARED_PREFIXES):
                result.append(f'@/{path}')
            else:
                result.append(f'@{section}/{path}')
                changed = True
            i = path_end
        else:
            result.append('@/')
            i = idx + 2
    new_content = ''.join(result)
    if changed:
        with open(fp, 'w') as fh:
            fh.write(new_content)
    return changed

def migrate_section(section):
    src_dir = os.path.join(BASE, 'apps', section, 'src')
    sec_dir = os.path.join(BASE, 'src', 'app', '(sections)', section)
    
    if os.path.exists(sec_dir):
        shutil.rmtree(sec_dir)
    
    # Copy ALL src content into the section directory
    for item in os.listdir(src_dir):
        s = os.path.join(src_dir, item)
        d = os.path.join(sec_dir, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, symlinks=True)
        else:
            os.makedirs(sec_dir, exist_ok=True)
            shutil.copy2(s, d)
    
    # Move app/* content UP one level (app/ content should be at section root)
    app_dir = os.path.join(sec_dir, 'app')
    if os.path.exists(app_dir) and os.path.isdir(app_dir):
        for item in os.listdir(app_dir):
            s = os.path.join(app_dir, item)
            d = os.path.join(sec_dir, item)
            if os.path.exists(d):
                if os.path.isdir(d) and os.path.isdir(s):
                    shutil.rmtree(d)
                else:
                    os.remove(d)
            shutil.move(s, d)
        shutil.rmtree(app_dir)
    
    # Rewrite imports
    files_rewritten = 0
    for root, dirs, files in os.walk(sec_dir):
        for f in files:
            if f.endswith(('.ts', '.tsx')):
                if rewrite_file(os.path.join(root, f), section):
                    files_rewritten += 1
    return files_rewritten

def main():
    total = 0
    for section in APPS:
        print(f'Migrating {section}...')
        n = migrate_section(section)
        print(f'  -> {n} files rewritten')
        total += n
    
    # Copy shared components
    ui_src = os.path.join(BASE, 'apps', 'multimedia', 'src', 'components', 'ui')
    ui_dst = os.path.join(BASE, 'src', 'components', 'ui')
    if os.path.exists(ui_dst):
        shutil.rmtree(ui_dst)
    if os.path.exists(ui_src):
        shutil.copytree(ui_src, ui_dst)
    
    # Copy shared utils
    utils_src = os.path.join(BASE, 'apps', 'multimedia', 'src', 'lib', 'utils.ts')
    utils_dst = os.path.join(BASE, 'src', 'lib', 'utils.ts')
    os.makedirs(os.path.dirname(utils_dst), exist_ok=True)
    shutil.copy2(utils_src, utils_dst)
    
    print(f'\nDone! {total} files rewritten across {len(APPS)} sections')

if __name__ == '__main__':
    main()
