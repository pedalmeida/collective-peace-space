

## Reestruturar secção "Como Participar"

### Resumo

Reorganizar a secção para: (1) CTA do WhatsApp destacado em primeiro lugar, (2) formulário de email em segundo, (3) remover info do próximo evento.

### Layout final

```text
┌─────────────────────────────────┐
│  COMO PARTICIPAR 🪷             │
│  Junta-te a nós                │
│  (texto introdutório)          │
└─────────────────────────────────┘

┌─────────────────────────────────┐  ← módulo 1: fundo branco, destaque
│  🟢 COMUNIDADE WHATSAPP        │
│  Texto convidativo curto        │
│  [ Entrar na Comunidade ▸ ]    │  ← botão grande, verde WhatsApp
└─────────────────────────────────┘

  "ou, se preferires, deixa o     
   teu email:"                    ← texto separador

┌─────────────────────────────────┐  ← módulo 2: card atual (sem próximo evento)
│  [Nome]                         │
│  [Email]                        │
│  [Comentários]                  │
│  ☐ Quero organizar              │
│  [Receber informações]          │
└─────────────────────────────────┘
```

### Alterações em `src/components/Participate.tsx`

1. **Remover** o bloco "PRÓXIMO EVENTO" (linhas 80-90: título, data, local)
2. **Remover** imports não usados (`CalendarDays`, `MapPin`)
3. **Mover e transformar** a secção WhatsApp (atualmente no fundo, linhas 162-183) para **antes** do formulário, como um card destacado:
   - Fundo `bg-white` (ou `bg-card`), border, `rounded-2xl`, `p-8`
   - Ícone WhatsApp maior (w-6 h-6)
   - Botão maior com fundo verde `bg-[#25D366]` texto branco, `py-3 px-8`
   - Texto: "Junta-te à nossa comunidade WhatsApp para acompanhar novidades e próximos eventos"
4. **Adicionar texto separador** entre os dois módulos: "Ou, se preferires, deixa o teu email para receber notificações"
5. O formulário de email mantém-se no segundo card, sem a info do próximo evento

### Ficheiro alterado

- `src/components/Participate.tsx` — único ficheiro

