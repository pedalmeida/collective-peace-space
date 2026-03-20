

## Adicionar ao Calendário — Multi-plataforma

### O que muda
O botão "Adicionar ao calendário" passa a abrir um pequeno dropdown com 3 opções:
- **Google Calendar** — abre link directo (já implementado)
- **Apple Calendar** — gera e descarrega ficheiro `.ics`
- **Outlook** — gera e descarrega ficheiro `.ics` (mesmo formato, mesmo ficheiro)

### Implementação

**1. Criar utilitário `src/lib/calendar.ts`**
- Função `buildGoogleCalendarUrl(event)` — extraída do código duplicado em `NextEvent.tsx` e `EventDetail.tsx`
- Função `generateIcsFile(event)` — gera string ICS com VCALENDAR/VEVENT e dispara download via `Blob` + `URL.createObjectURL`

**2. Criar componente `src/components/CalendarDropdown.tsx`**
- Botão principal com o texto actual "Adicionar ao calendário"
- Ao clicar, abre um Popover (usando `@radix-ui/react-popover` já disponível) com 3 opções:
  - Google Calendar (ícone + label) → abre URL nova tab
  - Apple Calendar (ícone + label) → download .ics
  - Outlook (ícone + label) → download .ics
- Estilo consistente com o design actual (accent colors, rounded-lg, tracking-wide)

**3. Substituir botões existentes**
- `NextEvent.tsx` — trocar `MagneticButton` pelo novo `CalendarDropdown`
- `EventDetail.tsx` — trocar o `<a>` pelo novo `CalendarDropdown`
- Remover as funções `buildCalendarUrl` duplicadas de ambos os ficheiros

### Detalhes técnicos
- Formato ICS padrão RFC 5545, sem dependências externas
- O ficheiro `.ics` funciona nativamente no Apple Calendar, Outlook desktop/web e qualquer app compatível
- O dropdown fecha ao clicar fora ou ao seleccionar uma opção

