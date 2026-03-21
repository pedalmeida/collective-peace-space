

## Próximos Eventos — suporte a múltiplos eventos

### O que muda

O componente `NextEvent` passa a carregar **todos** os eventos futuros (não apenas 1) e renderizá-los num layout responsivo.

### Novo evento a criar

Adicionar via backoffice admin (ou migration seed): **26 Abril, 15:30, local a confirmar**.

### Layout responsivo

- **Mobile**: 1 coluna, cards empilhados verticalmente
- **Tablet/Desktop**: grid de 2 colunas lado a lado (`grid grid-cols-1 md:grid-cols-2 gap-6`)
- Cada card mantém o design atual (border, rounded-2xl, shadow-sm) mas com `max-w` removido para se adaptar ao grid
- Título da secção muda para "Próximos eventos 📅"

### Ficheiros alterados

1. **`src/components/NextEvent.tsx`**
   - Query: remover `.limit(1).single()`, usar `.select("*")` com array de resultados
   - Estado: `events: Event[]` em vez de `event: Event | null`
   - Título: "Próximos eventos" (plural)
   - Layout: wrapper `grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto`
   - Extrair card individual para sub-componente `EventCard` dentro do ficheiro
   - Animação staggered: cada card com delay incremental

2. **Migration SQL** — seed do novo evento (26 Abril 2025, 15:30, "Local a confirmar", slug `abril-2025`)

