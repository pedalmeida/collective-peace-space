

## Otimizar carregamento das imagens do Hero

As 3 imagens do hero (`hero-globe.jpg`, `meditation-group-real.jpg`, `meditation-circle-real.jpg`) estão importadas como assets estáticos e são bundled pelo Vite, mas provavelmente são ficheiros grandes (fotos reais). O problema é que são carregadas tal como estão, sem otimização.

### Solução

1. **Comprimir e redimensionar as imagens** — as fotos do hero não precisam de resolução original. Redimensionar para ~800px de largura (a grid do hero tem no máximo ~480px de altura) e comprimir para qualidade 75-80%.

2. **Preload da imagem principal** — adicionar `<link rel="preload">` no `index.html` para a primeira imagem (hero-globe), que é `loading="eager"`.

3. **Lazy load nas imagens secundárias** — as duas imagens inferiores (`meditationGroup`, `meditationCircle`) já têm delay na animação, podem ter `loading="lazy"` explícito no `<img>`.

4. **Formato WebP** — converter as 3 imagens para WebP (melhor compressão que JPG). Vite serve-as tal como estão, por isso basta substituir os ficheiros.

### Ficheiros alterados

- **`src/assets/`** — substituir as 3 imagens por versões otimizadas (WebP, ~800px largura, qualidade 80%)
- **`src/components/Hero.tsx`** — adicionar `loading="lazy"` às duas imagens secundárias no `AnimatedImage`
- **`src/components/AnimatedImage.tsx`** — garantir que `loading` prop é passada ao `<img>`
- **`index.html`** — adicionar `<link rel="preload" as="image">` para a imagem principal do hero

### Detalhe técnico

A compressão será feita via script (`sharp` ou CLI) para reduzir o tamanho dos ficheiros de ~500KB+ para ~50-80KB cada, mantendo qualidade visual adequada para o tamanho de exibição.

