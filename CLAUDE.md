# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server at http://localhost:8080
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm test             # Run tests once
npm run test:watch   # Tests in watch mode
```

## Architecture

This is a React 18 + TypeScript SPA (Vite) for internal project/task/client management with a Supabase (PostgreSQL) backend.

**Key tech:** React Query for server state, Supabase JS for data/auth, DND-Kit for drag-and-drop, shadcn/ui (Radix UI) for components, React Hook Form + Zod for forms, Recharts for analytics.

### Structure

```
src/
├── pages/           # Route endpoints (one file per route)
├── components/      # Domain-driven: clientes/, projetos/, tarefas/, custom-board/, layout/, ui/
├── hooks/           # 46 custom hooks — all Supabase queries are abstracted here
├── contexts/        # AuthContext (global auth state)
├── lib/             # utils.ts (cn, exportToCSV), notifications.ts
├── styles/          # premium-zinc.ts — Tailwind token object for dark zinc board theme
├── integrations/
│   └── supabase/
│       ├── client.ts   # Supabase client init
│       └── types.ts    # Auto-generated DB types (do not edit manually)
└── test/setup.ts    # Vitest + jsdom + Testing Library setup
img/                 # Emplo.ia brand assets (PNG + SVG, white/color/black variants)
supabase/
├── functions/       # 6 Edge Functions (Deno)
└── migrations/      # SQL migration files
```

### Routes

**Public (unauthenticated):**

| Path | Page |
|------|------|
| `/login` | Login |
| `/register` | Cadastro |
| `/forgot-password` | Recuperação de senha |
| `/reset-password` | Redefinição de senha |

**Protected (require session):**

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/clientes` | Gestão de Clientes |
| `/projetos` | Gestão de Projetos |
| `/tarefas` | Gestão de Tarefas |
| `/wiki` | Wiki / Base de Conhecimento |
| `/templates` | Templates de Tarefas |
| `/automacoes` | Automações |
| `/comunicacoes` | Comunicações |
| `/relatorios` | Relatórios |
| `/configuracoes` | Configurações |
| `/boards/:slug` | Custom Board dinâmico |

### Data layer pattern

All data fetching uses React Query hooks in `src/hooks/`. Each domain has dedicated hooks. Hooks return `{ data, isLoading, error }` from `useQuery`/`useMutation`. Never fetch Supabase directly in components — always go through hooks.

### Hooks (46 total)

**Tarefas (9):**
- `useTarefas` — CRUD de tarefas, filtros, mutações
- `useTarefaComments` — comentários por tarefa
- `useTarefaActivities` — feed de atividade/histórico por tarefa
- `useTarefaAttachments` — upload e listagem de anexos
- `useTarefaBoardColumns` — colunas do Kanban de tarefas
- `useTarefaTags` — tags associadas a tarefas
- `useChecklistSubitems` — subitens de checklist dentro de itens de checklist
- `useTimeEntries` — registro de horas trabalhadas por tarefa
- `useTaskDependencies` — dependências entre tarefas (bloqueio)

**Projetos (6):**
- `useProjetos` — CRUD de projetos
- `useProjetoTarefas` — tarefas vinculadas a um projeto
- `useProjetoComments` — comentários por projeto
- `useProjetoActivities` — feed de atividade por projeto
- `useProjetoBoardColumns` — colunas do Kanban de projetos
- `useProjetosOverview` — view agregada com métricas de projetos

**Clientes (4):**
- `useClientes` — CRUD de clientes
- `useClienteComments` — comentários por cliente
- `useClienteActivities` — feed de atividade por cliente
- `useClienteProjetos` — projetos vinculados a um cliente

**Custom Boards (6):**
- `useCustomBoards` — CRUD de boards customizados
- `useCustomBoardCards` — cards dentro de um board
- `useCustomBoardColumns` — colunas de um board customizado
- `useCustomBoardCardComments` — comentários em cards
- `useCustomBoardCardActivities` — histórico de atividade em cards
- `useCustomBoardCardAttachments` — anexos em cards

**Automações (3):**
- `useAutomations` — CRUD de automações
- `useAutomationEvents` — log de execuções de automações
- `useDailyCheckin` — questões e respostas do daily checkin

**Wiki (5):**
- `useWikiFiles` — arquivos da wiki (listagem, CRUD)
- `useWikiFolders` — estrutura de pastas da wiki
- `useWikiRecentFiles` — arquivos acessados recentemente
- `useWikiUpload` — upload de arquivos para a wiki
- `useWikiTaskFile` — conexão entre tarefa e arquivo wiki

**Shared / Infraestrutura (13+):**
- `useDashboardData` — métricas agregadas para o dashboard
- `useProfiles` — perfis de usuários do workspace
- `useNotifications` — notificações em tempo real
- `useBoardColumns` — colunas genéricas de board
- `useBoardSettings` — configurações de visibilidade de colunas
- `useTaskTemplates` — templates reutilizáveis de tarefas
- `useDuplicateTemplate` — duplicar template existente
- `useDuplicateAutomation` — duplicar automação existente
- `useWebhookApiKeys` — gerenciamento de API keys para webhooks
- `useTheme` — controle de tema (dark/light)
- `useSubtarefas` — subtarefas vinculadas a uma tarefa principal
- `use-mobile` — detecção de viewport mobile
- `use-toast` — sistema de toast notifications

### Component Organization

**`components/tarefas/`**
- `board/` → `TaskKanbanBoard`, `TaskKanbanColumn`, `TaskCard`, `TarefaKanbanBoard`, `TarefaBoardCard`, `TarefaBoardColumn`, `TarefaColumnHeader`, `AddTarefaColumnButton`
- `detail/` → `TaskDetailHeader`, `TaskChecklistSection`, `ChecklistSubitemsList`, `TaskActivityTimeline`, `TaskTagsSection`, `TaskPropertySidebar`, `TaskAttachmentsSection`, `TaskSubtasksSection`, `TaskPropertyGrid`, `TaskDetailSectionSurface`, `TarefaActivityFeed`, `TarefaCommentsSection`, `TarefaDescriptionEditor`, `TarefaAdvancedSections`
- `page/` → `TasksFilterBar`, `TasksPageHeader`, `TasksEmptyState`
- `table/` → `TaskTableView`
- `shared/` → `TaskPriorityIndicator`, `TaskProgressBar`, `TaskTagBadges`
- `modals/` → `TimeEntryModal`

**`components/projetos/`**
- `board/` → `ProjetoKanbanBoard`, `ProjetoBoardCard`, `ProjetoBoardColumn`, `ProjetoColumnHeader`, `AddProjetoColumnButton`
- `detail/` → `ProjetoDetailTabs`, `ProjetoTarefasTab`, `ProjetoTarefasPriorityTabs`, `ProjetoActivityFeed`, `ProjetoCommentsSection`, `ProjetoDescriptionEditor`, `ProjetoDetailSectionSurface`, `CompletionMessageModal`
- `modals/` → `ProjetoFormModal`, `DeleteProjetoModal`

**`components/clientes/`**
- `board/` → `KanbanBoard`, `BoardCard`, `BoardColumn`, `ColumnHeader`, `AddColumnButton`
- `detail/` → `ClienteDetailTabs`, `ClienteProjetosTab`, `ActivityFeed`, `CommentsSection`, `DescriptionEditor`, `CommentItem`, `MentionInput`
- `modals/` → `ClienteFormModal`, `ColumnFormModal`, `DeleteConfirmModal`

**`components/custom-board/`**
- `CustomBoardKanban`, `CustomBoardCard`, `CustomBoardColumn`, `CustomBoardColumnHeader`, `CustomBoardAddColumn`, `CustomBoardHeader`
- `CustomBoardCardModal` — modal completo de detalhe do card
- `CustomBoardChecklistSection`, `CustomBoardChecklistSubitemsList`
- `CustomBoardDescriptionEditor`, `CustomBoardTagsSection`, `CustomBoardTemplateSelector`
- `BoardSettingsModal` — configuração de visibilidade de colunas
- `SendMessageModal`
- `detail/` → `CustomBoardDetailHeader`, `CustomBoardPropertySidebar`, `CustomBoardDetailSectionSurface`, `CustomBoardAttachmentsSection`
- `CustomBoardActivityTimeline`

**`components/layout/`**
- `AppLayout`, `AppHeader`, `AppSidebar`, `TopBar`
- `AuthLayout` — layout split-panel para páginas de auth
- `BoardsSidebarSection` — seção de boards na sidebar
- `CreateBoardModal`, `EditBoardModal`
- `NotificationCenter`, `UserMultiSelect`

**`components/ui/`** — shadcn/ui components (não modificar manualmente)
- `markdown-editor/` → `MarkdownEditor`, `InlineMarkdownEditor`, `MarkdownPreview`, `MarkdownToolbar`
- `expandable-text.tsx` — texto truncado com expand

### Auth

`AuthContext.tsx` wraps the app with session state. `ProtectedRoute.tsx` guards authenticated routes. Auth is handled entirely via Supabase Auth.

Auth pages (`/login`, `/register`, `/forgot-password`, `/reset-password`) all use `AuthLayout` — a split-panel dark layout with the Emplo.ia brand on the left and the form on the right.

### Supabase Edge Functions

Located in `supabase/functions/` (Deno runtime):

| Function | Responsabilidade |
|----------|-----------------|
| `execute-automation` | Executa lógica de automações configuradas |
| `generate-client-comms` | Gera sugestões de comunicação para clientes via IA |
| `refresh-projetos-overview` | Atualiza a view materializada de overview de projetos |
| `send-daily-checkin` | Envia notificação/mensagem do daily checkin para usuários |
| `send-webhook-message` | Envia mensagens outbound via webhook para integrações externas |
| `webhook-inbound` | Recebe e processa dados de integrações externas (via API key) |

## Features Implementadas

### Sistema de Checklist Interativo
Tarefas e cards de custom board possuem checklists com subitens. Suporte a drag-and-drop para reordenar, barra de progresso automática, timestamps de conclusão (`dd/MM HH:mm`), e operações CRUD completas. Componentes: `TaskChecklistSection`, `ChecklistSubitemsList`, `CustomBoardChecklistSection`, `CustomBoardChecklistSubitemsList`.

### Quick Complete com Time Entry
Botão flutuante no hover de cards do Kanban. Ao clicar, abre `TimeEntryModal` para registrar horas/minutos + descrição opcional + flag billable. Opção de "skip" disponível. Ao confirmar, completa a tarefa automaticamente e marca todos os itens do checklist como concluídos. Hook: `useTimeEntries`.

### Task Dependencies
Sistema de bloqueio entre tarefas — uma tarefa pode bloquear outras. Cards bloqueados exibem ícone de cadeado. Gerenciado por `useTaskDependencies`. Visível na seção de propriedades do detalhe da tarefa.

### Task Detail Header Editável
Header da tarefa com edição inline via duplo-clique no título. Badge do projeto vinculado. Link para arquivo wiki associado. Menu dropdown com ações: renomear, compartilhar, duplicar, deletar. Componente: `TaskDetailHeader`.

### Custom Boards Dinâmicos
Boards acessíveis em `/boards/:slug`. Colunas totalmente customizáveis (nome, cor, ordem). Cards com suporte a checklist, descrição (markdown), tags, anexos, comentários, histórico de atividade e propriedades customizadas. Boards listados na sidebar via `BoardsSidebarSection`. Criados/editados via `CreateBoardModal`/`EditBoardModal`.

### Board Settings Modal
Permite ocultar/exibir colunas individualmente em qualquer board. Estado persiste via `useBoardSettings` (Supabase). Componente: `BoardSettingsModal`, acessível via `BoardSettingsButton`.

### Daily Checkin
Questões configuráveis por scope (workspace/projeto). Cards de resposta por usuário. Envio automatizado via Supabase Function `send-daily-checkin`. Gerenciado por `useDailyCheckin`. Interface em `DailyCheckinTab`, `DailyCheckinUserCard`, `DailyCheckinQuestionsConfig`.

### Webhook Inbound
Integração externa via endpoint de webhook. API keys gerenciadas pelo usuário via `useWebhookApiKeys`. Recebe dados processados pela function `webhook-inbound`. Configurado em `WebhookInboundSection`.

### Wiki Integration
Sistema completo de base de conhecimento: upload de arquivos, estrutura de pastas, editor markdown, busca (`WikiClientSearch`), arquivos recentes, visualização inline. Conexão direta com tarefas via `useWikiTaskFile`. Componentes em `components/wiki/`.

### Automações
Dashboard de automações com CRUD completo, log de execuções, duplicação, e configuração de scope. Inclui formulário de automação (`AutomationForm`) e lista de logs (`AutomationLogsList`). Suporte a webhook inbound e daily checkin como triggers/actions.

## Design System

### Brand: Emplo.ia
The app uses the **Emplo.ia** brand identity (defined in `docs/desing.md`):

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#3F1757` (HSL `278 58% 22%`) | Roxo principal |
| Action/CTA | `#ED6A5A` | Botões de ação, CTAs |
| Text | `#1E1E1E` | Corpo de texto |
| Lilás | `#CBC5EA` | Detalhes, foco de inputs |
| Turquesa | `#97EAD2` | Badges, indicadores positivos |
| Beige | `#E8DAB2` | Fundos alternativos |
| Rosa | `#FAD5D1` | Notificações suaves |

### Fonts
Two font families loaded in `index.html` via Google Fonts:
- **Krona One** — Títulos, headlines, H1/H2 (`font-family: 'Krona One', sans-serif`)
- **Lexend Deca** — UI body, labels, botões, inputs (`font-family: 'Lexend Deca', sans-serif`)
- **Inter** — Font padrão do sistema (body global via `src/index.css`)

### Logo assets (`img/`)
Use the correct logo variant per background (per brand guide):
- **Fundo escuro/saturado** → `emploia-horizontal-branco@2x.png` ou `.svg`
- **Fundo claro (≤ 20% intensidade)** → `emploia-horizontal-colorida@2x.png` ou `.svg`
- **Favicon / ícone pequeno** → `emploia-favicon-branco@2x-1.png`
- Nunca aplicar sombra, filtro ou efeito sobre o logo

### Auth pages dark layout
- Left panel: `#3F1757` background, parallax effect rastreando mouse, favicon branco 44px, frase em Krona One
- Right panel: `#12101A` background
- Dark inputs: `bg #1C1929`, border `#2E2A3B`, foco lilás (`#CBC5EA`)
- Placeholder: via classe CSS `.auth-input` (definida em `src/index.css`)

### Premium Kanban boards
Dark Zinc theme para boards. Tokens centralizados em `src/styles/premium-zinc.ts` — objeto `premiumZinc` exporta classes Tailwind por área (coluna, card, header, empty state, drag overlay, etc.). Consulte `docs/premium-kanban-guidelines.md` para regras detalhadas de uso por área do board.

### Theming
- Dark mode é **padrão** (`<html class="dark">`)
- `next-themes` + class-based dark mode via `tailwind.config.ts`
- **Path alias:** `@/*` → `src/*`

## Notes

- UI labels are in **Portuguese** (Clientes, Projetos, Tarefas, etc.)
- TypeScript is intentionally relaxed: `strict: false`, `noImplicitAny: false`
- `integrations/supabase/types.ts` is auto-generated — regenerate with Supabase CLI when the schema changes
- The project integrates with **Lovable.dev** (component tagger active in dev mode via `lovable-tagger`)
- Tests use **Vitest** with jsdom environment; test files match `**/*.test.{ts,tsx}`
