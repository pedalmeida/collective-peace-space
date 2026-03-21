

## CTAs de partilha nos cards de Próximos Eventos

Adicionar um botão "Partilhar o evento 🌍" a cada card de evento, com comportamento idêntico ao da secção InspireShare mas com a informação dinâmica de cada evento específico.

### O que muda

**`src/components/NextEvent.tsx`** — no componente `EventCard`:

1. Adicionar botão de partilha abaixo do `CalendarDropdown`, dentro do bloco `mt-auto`
2. Lógica de partilha por evento:
   - **Share nativo** (mobile): `navigator.share({ text: msg })`
   - **Fallback** (desktop): copia para clipboard com feedback "Copiado! ✓"
3. Mensagem dinâmica por evento:
   ```
   🌿 Vou participar no evento "{event.title}" — meditação para um Mundo Melhor 🙏

   📅 {dia da semana}, {dia} de {mês} às {hora}
   📍 {local}

   Junta-te a mim:
   https://meditarmundomelhor.org
   ```
4. Estilo do botão: igual ao da secção InspireShare — `bg-primary text-primary-foreground`, com ícone `Share2`

### Layout do bloco inferior de cada card

```text
┌─────────────────────┐
│  ... conteúdo ...   │
│                     │
│  [Adicionar ao cal] │
│  [Partilhar evento] │
└─────────────────────┘
```

Ambos os botões centrados, empilhados com `gap-3`.

