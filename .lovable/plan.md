

## Guardar emails de subscritores na base de dados

### O que muda
O formulário "Receber informações dos eventos" passa a guardar o email na base de dados. Se o email já existir, mostra a mensagem "Já temos o teu email! Receberás as novidades." em vez de o inserir novamente.

### Implementação

**1. Criar tabela `subscribers` (migração)**
```sql
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (subscrever-se)
CREATE POLICY "Anyone can subscribe"
  ON public.subscribers FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins podem ver todos os subscritores
CREATE POLICY "Admins can view subscribers"
  ON public.subscribers FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
```

Note: a tabela não expõe emails publicamente — apenas admins podem fazer SELECT.

**2. Actualizar `Participate.tsx`**
- Importar `supabase` client
- No `handleSubmit`: tentar inserir o email; se falhar com código de violação de unicidade (`23505`), mostrar mensagem "Já temos o teu email!"
- Adicionar estado de loading e de "já existe"
- Mensagem de sucesso: "Obrigado! Receberás notificações sobre os próximos eventos. 🪷"
- Mensagem de duplicado: "Já temos o teu email! Receberás as novidades. 🪷"
- Mensagem de erro genérico com toast

