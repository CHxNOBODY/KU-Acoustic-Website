from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json

source = Path('D:/KUAC Website Picture')
output = Path('artifacts/photo-review')
output.mkdir(parents=True, exist_ok=True)
files = sorted(path for path in source.rglob('*') if path.suffix.lower() in {'.jpg', '.jpeg', '.png', '.heic'})
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass
manifest = []
for index, path in enumerate(files):
    try:
        with Image.open(path) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            manifest.append({'index': index, 'file': str(path), 'size': image.size})
            image.thumbnail((310, 205))
            tile = Image.new('RGB', (330, 245), '#f7f6f0')
            tile.paste(image, ((330-image.width)//2, 5+(205-image.height)//2))
            ImageDraw.Draw(tile).text((10, 216), f'{index:02}  {path.stem[:33]}', fill='#234c3e')
            tile.save(output / f'tile-{index:02}.jpg')
    except Exception as error:
        manifest.append({'index': index, 'file': str(path), 'error': str(error)})
for page in range((len(files)+15)//16):
    sheet = Image.new('RGB', (1320, 980), 'white')
    for slot in range(16):
        tile = output / f'tile-{page*16+slot:02}.jpg'
        if tile.exists():
            with Image.open(tile) as image:
                sheet.paste(image, ((slot%4)*330, (slot//4)*245))
    sheet.save(output / f'sheet-{page+1}.jpg')
(output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Reviewed {sum("error" not in item for item in manifest)} of {len(files)} images; contact sheets in {output}.')
