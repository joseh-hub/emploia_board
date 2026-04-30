# Aura Grid Desk — Emplo.ia

Plataforma interna de gestão de projetos, tarefas e clientes da **Emplo.ia**. Inclui boards Kanban customizáveis, automações, wiki, checkin diário, time tracking e relatórios.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui (Radix UI) + Tailwind CSS
- **Estado servidor:** TanStack Query (React Query)
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Drag-and-drop:** DND-Kit
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

## Setup local

```sh
# 1. Clonar o repositório
git clone <YOUR_GIT_URL>
cd aura-grid-desk

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase

# 4. Subir o servidor de desenvolvimento
npm run dev
# Disponível em http://localhost:8080
```

## Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key>
```

Obtenha os valores em: **Supabase Dashboard → Project Settings → API**.

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento (porta 8080)
npm run build        # Build de produção
npm run build:dev    # Build de desenvolvimento
npm run preview      # Preview do build de produção
npm test             # Rodar testes (Vitest)
npm run test:watch   # Testes em modo watch
```

## Principais funcionalidades

- **Dashboard** com métricas agregadas, gráficos de crescimento e status
- **Gestão de Clientes** — Kanban + tabela, detalhes, comentários, histórico
- **Gestão de Projetos** — Kanban + visão geral, tarefas por projeto, progresso
- **Gestão de Tarefas** — Kanban + tabela, checklist interativo, subtarefas, dependências, time tracking, tags, anexos, wiki integration
- **Custom Boards** — boards dinâmicos em `/boards/:slug` com colunas e cards totalmente customizáveis
- **Wiki** — base de conhecimento com pastas, upload, editor markdown, busca
- **Automações** — criação de automações com triggers/actions, log de execuções, webhook inbound
- **Daily Checkin** — questões configuráveis por escopo, cards de resposta por usuário
- **Templates** — templates reutilizáveis de tarefas e boards
- **Comunicações** — geração de sugestões de comunicação para clientes via IA
- **Relatórios** — visão consolidada de métricas

## Contexto de desenvolvimento

Para contexto completo de arquitetura, hooks, componentes, design system e convenções, consulte [CLAUDE.md](./CLAUDE.md).
