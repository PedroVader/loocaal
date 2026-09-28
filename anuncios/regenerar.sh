#!/bin/bash
# Regenera las imágenes de anuncios (anuncios/*.png) a partir de anuncios/src/*.html.
# Uso: bash anuncios/regenerar.sh
set -e
cd "$(dirname "$0")/.."
TMP=/private/tmp/claude-502/-Users-pedroansio-loocaal/780e26b8-9483-4dff-8175-1350be890f03/scratchpad
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 1. Traer al proyecto las fuentes de los 12 anuncios actuales (sector-*.html), si aún están en la carpeta temporal
if ls "$TMP"/v2-*.html >/dev/null 2>&1; then
  for f in "$TMP"/v2-*.html; do cp "$f" "anuncios/src/sector-$(basename "$f" | sed 's/^v2-//')"; done
fi

# 2. Precio: 1.200 € -> 690 €
for f in anuncios/src/*.html anuncios/README.md; do sed -i '' 's/1\.200 €/690 €/g' "$f"; done

# 3. Renderizar
n=0
for f in anuncios/src/*.html; do
  "$CHROME" --headless=new --hide-scrollbars --allow-file-access-from-files --window-size=1080,1080 \
    --screenshot="$PWD/anuncios/$(basename "$f" .html).png" "file://$PWD/$f" 2>/dev/null
  n=$((n+1))
done

echo "✔ $n imágenes generadas en anuncios/"
echo "Quedan con 1.200 €: $(grep -l '1\.200' anuncios/src/* 2>/dev/null | wc -l | tr -d ' ') (debería ser 0)"
