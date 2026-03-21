

## Hero — 3 versões visuais alternativas para avaliar

Vou implementar as 3 opções como variantes alternáveis, controladas por uma prop ou estado, para poderes ver e escolher a que preferes. Depois removemos as que não ficarem.

---

### Versão A — Linha orgânica animada

Um SVG path curvo que se desenha lentamente atrás do texto do Hero, evocando uma onda de respiração. Usa `motion.path` com `pathLength` animado de 0 a 1, em loop suave. Cor dourada (`accent`) com opacidade baixa (~15%). Posicionado absolutamente atrás do bloco de texto.

### Versão B — Aurora / gradiente vivo

Reutiliza o componente `Aurora.tsx` já existente no projeto (baseado em OGL/WebGL), posicionado absolutamente no fundo do Hero com opacidade reduzida (~20-30%). Cores alinhadas com a paleta: tons dourados e verdes suaves. Ocupa toda a largura da secção, atrás de todo o conteúdo.

### Versão C — Texto com highlight animado

A palavra "mundo melhor" recebe um sublinhado/destaque dourado que se desenha da esquerda para a direita ao entrar em viewport. Implementado com `motion.span` usando `scaleX` de 0 a 1 com `origin-left`, posicionado como pseudo-elemento atrás do texto. Cor `accent` com ~25% opacidade.

---

### Implementação técnica

**Novo componente**: `src/components/HeroVisualVariant.tsx`
- Recebe prop `variant: 'A' | 'B' | 'C'` para alternar entre versões
- Exporta cada efeito como sub-componente

**Ficheiros alterados**:
- `src/components/Hero.tsx` — importa o novo componente e coloca-o no local adequado; adiciona estado temporário para alternar variante (removido depois da escolha)

**Dependências**: Nenhuma nova — usa `motion/react` (já instalado) e `Aurora.tsx` (já existe).

