from pathlib import Path
import json
import os
import shutil

root = Path(__file__).resolve().parent.parent
dist = root / "dist"

if dist.exists():
    shutil.rmtree(dist)
dist.mkdir()

excluded = {".git", ".netlify", "dist", "__pycache__"}
for item in root.iterdir():
    if item.name in excluded:
        continue
    target = dist / item.name
    if item.is_dir():
        shutil.copytree(item, target, ignore=shutil.ignore_patterns("__pycache__"))
    else:
        shutil.copy2(item, target)

config = {
    "supabaseUrl": os.environ.get("VITE_SUPABASE_URL", ""),
    "supabaseAnonKey": os.environ.get("VITE_SUPABASE_ANON_KEY", ""),
}
(dist / "founding" / "config.js").write_text(
    "window.AURA_CONFIG = " + json.dumps(config) + ";\n",
    encoding="utf-8",
)

print(f"Built AURA website to {dist}")
if not all(config.values()):
    print("Note: Supabase variables are not set; Founding Wish List submissions remain disabled.")
