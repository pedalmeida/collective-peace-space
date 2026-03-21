

## Eventos Passados — Cards com Flyer

### O que muda
Substituir os cards compactos (lista simples) por cards maiores que mostram o flyer de cada evento, com layout visual mais rico.

### Layout
- Container alargado de `max-w-2xl` para `max-w-4xl`
- Grid responsivo: 1 coluna mobile, 2 colunas desktop (`grid grid-cols-1 md:grid-cols-2 gap-6`)
- Cada card:
  - Imagem do flyer no topo (aspect-ratio ~3:4, `rounded-t-xl`, object-cover)
  - Se não houver flyer, placeholder subtil com ícone
  - Abaixo: título, localização com ícone MapPin, data formatada
  - Link clicável para `/evento/:slug`
  - Hover: ligeiro scale + shadow

### Ficheiros alterados
- `src/components/PastEvents.tsx` — redesenho do layout e cards

