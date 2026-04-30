
# Checklist de CS nos cards de Cliente

## Visão geral

Adicionar uma seção de **Checklist** dentro do modal de detalhe do Cliente (mesma UX já usada em Tarefas e Custom Boards), alimentada por um **template padrão editável** em Configurações. Todo cliente novo recebe o template automaticamente (com opção de pular no formulário). Clientes antigos podem receber o checklist via botão manual no próprio card.

## O que será construído

### 1. Banco de dados (migration)

**Tabela `cliente_checklist_items`** — itens de checklist por cliente
- `id` uuid PK
- `cliente_id` bigint (FK lógica para `metadata_clientes.id`)
- `texto` text
- `concluido` boolean (default false)
- `position` int
- `completed_at` timestamptz
- `completed_by` uuid
- `created_at`, `updated_at` timestamptz
- RLS: `authenticated` pode ler/inserir/atualizar/deletar (segue padrão das outras tabelas de cliente)

**Tabela `cliente_checklist_template`** — template padrão único do workspace
- `id` uuid PK
- `position` int
- `texto` text
- `created_at`, `updated_at` timestamptz
- RLS: `authenticated` ALL

**Tabela `cliente_checklist_subitems`** (opcional, só se você precisar de subitens dentro de cada item — me confirma quando mandar o processo). Por enquanto deixo previsto mas só implemento se fizer sentido.

**Trigger `apply_default_checklist_to_cliente`** em `metadata_clientes` (AFTER INSERT)
- Lê todos os itens de `cliente_checklist_template` ordenados por `position`
- Insere uma cópia em `cliente_checklist_items` para o novo `cliente_id`
- Pode ser pulado passando uma flag (ver item 4)

### 2. Hook `useClienteChecklist`

Em `src/hooks/useClienteChecklist.ts`:
- `useClienteChecklist(clienteId)` — lista itens
- `useAddChecklistItem`, `useToggleChecklistItem`, `useUpdateChecklistItem`, `useDeleteChecklistItem`, `useReorderChecklistItems`
- `useApplyDefaultChecklist(clienteId)` — copia o template atual para o cliente (usado no botão retroativo)

Hook paralelo `useClienteChecklistTemplate` para a tela de configuração.

### 3. UI — Seção de checklist no modal do Cliente

Novo componente `src/components/clientes/detail/ClienteChecklistSection.tsx`, reaproveitando o visual de `TaskChecklistSection`:
- Lista de itens com checkbox + texto
- Barra de progresso (X/Y concluídos, %)
- Adicionar/editar/remover/reordenar (drag handles)
- Timestamp `dd/MM HH:mm` ao lado de itens concluídos
- Botão **"Aplicar checklist padrão"** quando o cliente não tem nenhum item (caso retroativo)

Integração: adicionar a seção em `ClienteDetailTabs` (nova aba "Checklist" ou bloco fixo na aba principal — vou seguir o padrão das tarefas e colocar como bloco fixo).

### 4. Toggle "pular checklist" no formulário

Em `ClienteFormModal.tsx`, adicionar um switch **"Aplicar checklist padrão de CS"** (default: ligado). Quando desligado, passamos uma flag via `sessionStorage` ou um campo temporário para o trigger não aplicar — ou, mais simples e robusto, não usamos trigger e fazemos o INSERT do checklist no próprio frontend logo após criar o cliente, condicional ao toggle.

**Decisão técnica:** vou usar a abordagem **frontend** (não trigger), porque:
- Permite controle fino do toggle sem hacks de session
- Mais fácil de debugar
- Mantém a lógica de "qual template aplicar" no código de aplicação, não no banco

Trigger fica como fallback opcional caso você prefira depois.

### 5. Tela de configuração do template padrão

Em `src/pages/Configuracoes.tsx`, adicionar uma nova aba/seção **"Checklist Padrão de Clientes"**:
- Lista editável dos itens do template (`cliente_checklist_template`)
- Adicionar item, editar texto inline, remover, reordenar (drag-and-drop)
- Aviso: "Mudanças aqui se aplicam apenas a novos clientes. Clientes existentes não são afetados."
- Componente: `src/components/clientes/ClienteChecklistTemplateConfig.tsx`

### 6. Botão retroativo no card

No `ClienteChecklistSection`, quando o cliente tiver 0 itens:
- Empty state com texto "Sem checklist neste cliente"
- Botão **"Aplicar checklist padrão de CS"** que chama `useApplyDefaultChecklist(clienteId)`

### 7. Indicador visual no card do board

Em `BoardCard.tsx` e `ClienteCard.tsx`, adicionar um mini-indicador discreto: ícone de checklist + `3/12` quando o cliente tiver itens. Sem poluir o card.

## O que **não** está no escopo agora

- Subitens dentro de itens de checklist (deixo previsto no schema mas só ativo se fizer sentido pelo seu processo)
- Cadência/recorrência (você escolheu lista única)
- Aplicação em massa retroativa (você prefere botão manual por card)
- Notificações automáticas em itens vencidos (pode ser feito num passo seguinte)

## Próximo passo

Quando você aprovar este plano e me **mandar a lista do processo de CS** (itens em ordem), eu já populo o `cliente_checklist_template` direto no INSERT inicial — assim o sistema já nasce com seu processo padrão funcionando. Se preferir, deixo o template vazio e você cadastra manualmente na tela de Configurações depois.

## Arquivos afetados

**Novos:**
- migration SQL (2 tabelas + RLS)
- `src/hooks/useClienteChecklist.ts`
- `src/hooks/useClienteChecklistTemplate.ts`
- `src/components/clientes/detail/ClienteChecklistSection.tsx`
- `src/components/clientes/ClienteChecklistTemplateConfig.tsx`

**Editados:**
- `src/components/clientes/detail/ClienteDetailTabs.tsx` (adicionar seção)
- `src/components/clientes/modals/ClienteFormModal.tsx` (toggle + aplicação inicial)
- `src/pages/Configuracoes.tsx` (aba do template)
- `src/components/clientes/board/BoardCard.tsx` (indicador)
- `src/components/clientes/ClienteCard.tsx` (indicador)
