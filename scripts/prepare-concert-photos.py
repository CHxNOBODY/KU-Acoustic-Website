"""Optimize selected new concert photos without modifying the originals."""
from pathlib import Path
from PIL import Image, ImageOps
import json

root = Path("D:/KUAC Website Picture")
selected = {
    "run-stage": "RuninRhythmConcert-598.jpeg",
    "run-vocal": "RuninRhythmConcert-1028.jpeg",
    "run-guitar": "RuninRhythmConcert-375.jpeg",
    "run-duet": "RuninRhythmConcert-790.jpeg",
    "run-crowd": "RuninRhythmConcert-654.jpeg",
    "run-family": "GROUP PHOTO 1 - LR Edited.jpeg",
}
output = Path("public/images/club")
sources_path = output / "sources.json"
sources = json.loads(sources_path.read_text(encoding="utf-8"))
for name, filename in selected.items():
    source = root / "รูปงานคอนใหญ่" / filename
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        for width in [80, 750, 900, 1100, 1200, 1600]:
            if width == 80:
                resized = ImageOps.fit(image, (80, 80), centering=(.5, .35))
            else:
                resized = image.copy()
                resized.thumbnail((width, round(image.height * width / image.width)))
            resized.save(output / f"{name}-{width}.webp", quality=84, method=6)
    sources[name] = str(source.relative_to(root))
sources_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Prepared {len(selected)} concert photos in six sizes.")
