# Lessons Learned — Collective Peace

> Report de otimização de tokens e velocidade de build, baseado no desenvolvimento deste projeto.

---

## 1. Resumo do Projeto

| Aspeto | Detalhe |
|--------|---------|
| **Stack** | React 18 + Vite + Tailwind CSS + TypeScript + shadcn/ui |
| **Backend** | Lovable Cloud (Supabase) — Edge Functions, Auth, Storage |
| **Integrações** | Google Sheets API (service account + JWT) |
| **Scope** | Landing page pública + painel admin + formulário de inscrição + galeria + gestão de eventos |
| **Migrações SQL** | 9 migrações incrementais |
| **Edge Functions** | 3 (add-subscriber, list-subscribers, create-admin) |

---

## 2. Padrões que Consumiram Mais Tokens

### 2.1 Iterações visuais incrementais

**Problema:** Ajustes de velocidade do ticker de organizadores levaram **4+ mensagens** para acertar ("mais rápido" → "ainda lento" → "demasiado rápido" → "um pouco mais lento").

**Custo:** Cada iteração = leitura do ficheiro + edição + resposta ≈ 2-4k tokens × 4 = ~12k tokens desperdiçados.

**Solução:** Especificar valores concretos no primeiro pedido:
```
❌ "Os logótipos estão muito lentos"
✅ "A animação do ticker deve demorar ~12s por ciclo completo"
```

### 2.2 Retrabalho por falta de especificação

**Problema:** O ticker foi implementado com CSS simples, depois precisou de ser refeito para loop contínuo sem "salto". A primeira implementação não descreveu o comportamento esperado.

**Custo:** ~8k tokens em retrabalho.

**Solução:** Descrever o comportamento esperado desde o início:
```
❌ "Adiciona um ticker com os logos"
✅ "Ticker infinito com loop contínuo (sem reset visível), 
    logos em grayscale que ficam coloridos no hover, 
    ~12s por ciclo, fade nos extremos"
```

### 2.3 Espaçamento e layout por tentativa e erro

**Problema:** Ajustes de margens e posicionamento de CTAs feitos em múltiplas iterações ("mais para cima", "tipo 15 ou 20px", "mais perto da citação").

**Custo:** ~6k tokens em micro-ajustes.

**Solução:** Usar **Visual Edits** do Lovable para alterações de espaçamento, ou especificar valores exatos:
```
❌ "Coloca mais perto da citação"
✅ "Reduz o margin-top do CTA para 16px (mt-4)"
```

### 2.4 Migrações SQL incrementais

**Problema:** 9 migrações criadas ao longo do projeto quando muitas podiam ter sido agrupadas. Cada migração = prompt + geração SQL + execução.

**Custo:** ~15k tokens em overhead de migrações separadas.

**Solução:** Planear o schema completo antes de começar:
```
❌ Criar tabela → adicionar coluna → adicionar outra coluna → alterar tipo
✅ Desenhar o schema completo num prompt inicial com todas as tabelas e colunas
```

### 2.5 Otimizações de performance tardias

**Problema:** Conversão de imagens para WebP e implementação de lazy loading feitas depois do site estar "pronto", quando podiam ter sido requisitos desde o início.

**Solução:** Incluir requisitos de performance no primeiro prompt do projeto.

---

## 3. Estratégias Práticas para Próximos Projetos

### 🎯 Prompts mais eficientes

| Estratégia | Antes | Depois |
|-----------|-------|--------|
| **Valores concretos** | "Mais rápido" | "Duração de 10s" |
| **Comportamento completo** | "Adiciona ticker" | "Ticker infinito, loop sem salto, grayscale→cor no hover, fade nos extremos, 12s/ciclo" |
| **Agrupar mudanças** | 3 prompts separados para cor, tamanho, espaçamento | 1 prompt com todas as alterações visuais |
| **Referências visuais** | Descrição textual vaga | Screenshot/mockup + descrição precisa |

### 🗄️ Base de dados

1. **Desenhar o schema completo** antes de começar — listar todas as tabelas, colunas, tipos e relações num único prompt
2. **Incluir RLS policies** no mesmo prompt da criação das tabelas
3. **Antecipar campos opcionais** — é mais barato criar colunas nullable desde o início do que adicionar depois

### ⚡ Performance desde o dia 1

- Pedir imagens em **WebP** desde o início
- Incluir `loading="lazy"` em todas as imagens abaixo do fold
- Usar `srcSet` para imagens responsivas
- Minificar assets estáticos

### 🔧 Usar as ferramentas certas

| Tarefa | Ferramenta ideal |
|--------|-----------------|
| Alterar texto, cores, espaçamento | **Visual Edits** (zero tokens) |
| Alterar lógica, componentes, API | **Chat prompt** |
| Testar responsividade | **Preview** do Lovable |
| Debug de erros | **Console logs** no Lovable |

### 📦 Estrutura de prompts complexos

Para features com múltiplas partes (ex: formulário + edge function + BD), usar um **prompt estruturado**:

```markdown
## Feature: Formulário de inscrição

### Campos
- Nome (text, obrigatório)
- Email (email, obrigatório)  
- Comentários (textarea, opcional)
- Quero organizar (checkbox, opcional)

### Backend
- Edge function: validar duplicados, append Google Sheets (5 colunas), insert BD
- Tabela: subscribers (name, email, comments text null, wants_to_organize bool default false)
- RLS: insert público, select apenas admin

### UI
- Dentro da secção "Participate"
- Estilo consistente com inputs existentes
- Toast de sucesso/erro
```

---

## 4. Checklist Pré-Projeto

Antes de enviar o primeiro prompt, responde a estas perguntas:

### Design
- [ ] Tenho mockups ou referências visuais?
- [ ] Defini a paleta de cores (valores HSL concretos)?
- [ ] Escolhi as fontes (display + body)?
- [ ] Defini breakpoints e comportamento mobile?

### Base de Dados
- [ ] Listei todas as tabelas e colunas necessárias?
- [ ] Defini os tipos de cada coluna (text, boolean, timestamp, etc.)?
- [ ] Identifiquei as relações entre tabelas?
- [ ] Defini as políticas de acesso (quem lê/escreve o quê)?

### Funcionalidade
- [ ] Listei todas as páginas/secções do site?
- [ ] Descrevi o comportamento de cada interação (animações, transições, etc.)?
- [ ] Identifiquei integrações externas (APIs, serviços)?
- [ ] Defini o fluxo de autenticação?

### Performance
- [ ] Vou usar WebP para imagens?
- [ ] Preciso de lazy loading?
- [ ] Há assets pesados que precisam de otimização?

### Prompts
- [ ] Agrupei mudanças relacionadas num único prompt?
- [ ] Usei valores concretos em vez de termos relativos?
- [ ] Incluí o comportamento esperado (não só o resultado visual)?

---

## 5. Template de Primeiro Prompt

```
Quero criar [tipo de projeto] com as seguintes características:

**Design:** [referência visual / mockup / estilo]
**Paleta:** [cores HSL]  
**Fontes:** [display + body]

**Páginas:**
1. [página] — [descrição breve]
2. ...

**Base de dados:**
- Tabela X: col1 (tipo), col2 (tipo), ...
- Tabela Y: ...
- Relações: X.user_id → auth.users

**Integrações:** [Google Sheets, Stripe, etc.]
**Auth:** [email/password, social, etc.]

**Performance:** WebP, lazy loading, [outros]
```

---

## 6. Estimativa de Poupança

Com estas práticas, a estimativa de redução de tokens para um projeto semelhante:

| Área | Tokens gastos (estimativa) | Poupança potencial |
|------|---------------------------|-------------------|
| Iterações visuais | ~20k | 60-70% com valores concretos |
| Migrações SQL | ~15k | 50-60% com schema pré-planeado |
| Retrabalho | ~10k | 70-80% com specs completas |
| Performance tardia | ~5k | 90% se incluído desde o início |
| **Total estimado** | **~50k** | **~60% de redução** |

---

*Gerado em Março 2026 com base no desenvolvimento do projeto Collective Peace.*
