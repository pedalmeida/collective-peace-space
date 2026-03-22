

## Criar ficheiro `LESSONS_LEARNED.md` no repositório

Um único ficheiro Markdown na raiz do projeto com o report de lessons learned, organizado nas seguintes secções:

### Conteúdo do report

1. **Resumo do projeto** — stack, scope (landing page + admin panel + edge functions + Google Sheets integration)

2. **Padrões que consumiram mais tokens** — baseado na análise do histórico:
   - Iterações visuais incrementais (velocidade do ticker: 4 mensagens para acertar; espaçamento de CTAs: múltiplas tentativas)
   - Retrabalho por falta de especificação inicial (animação CSS vs Framer Motion no ticker)
   - Otimizações de performance feitas depois (imagens WebP deveriam ter sido feitas desde o início)
   - Múltiplas migrações SQL incrementais (9 migrações quando podiam ser consolidadas)

3. **Estratégias práticas para próximos projetos**:
   - Dar contexto visual/referências no primeiro prompt (mockups, screenshots, exemplos)
   - Especificar valores concretos (px, cores, durações) em vez de "mais rápido" / "mais lento"
   - Agrupar mudanças visuais relacionadas num único prompt
   - Planear schema da BD antes de começar (evitar migrações incrementais)
   - Usar formatos otimizados (WebP) e lazy loading desde o início
   - Usar Visual Edits para alterações de texto/cor em vez de prompts
   - Descrever o comportamento esperado (ex: "loop contínuo sem salto") no primeiro pedido

4. **Checklist pré-projeto** — lista rápida de decisões a tomar antes de começar a buildar

### Ficheiro criado

- **`LESSONS_LEARNED.md`** — na raiz do projeto, ~150-200 linhas

