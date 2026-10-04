"""Create browser-ready copies of selected club photos, leaving originals intact.

Rebuild the selections recorded in sources.json with Pillow and pillow-heif.
Stable source paths keep selections intact when more photos are added.
"""
from pathlib import Path
from PIL import Image, ImageOps
import json
import pillow_heif

pillow_heif.register_heif_opener()
output = Path('public/images/club')
output.mkdir(parents=True, exist_ok=True)
sources = json.loads((output / 'sources.json').read_text(encoding='utf-8'))
for name, relative_path in sources.items():
    source = Path('D:/KUAC Website Picture') / relative_path
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        for width in [80, 750, 900, 1100, 1200, 1600]:
            if width == 80:
                resized = ImageOps.fit(image, (80, 80), centering=(.5, .35))
            else:
                resized = image.copy()
                resized.thumbnail((width, round(image.height * width / image.width)))
            resized.save(output / f'{name}-{width}.webp', quality=84, method=6)
    sources[name] = str(Path(source).relative_to('D:/KUAC Website Picture'))
(output / 'sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding='utf-8')
total = sum(path.stat().st_size for path in output.glob('*.webp'))
print(f'Prepared {len(sources)} club photos in six sizes ({total / 1024 / 1024:.1f} MB total).')
