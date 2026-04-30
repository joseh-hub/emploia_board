## Objetivo

Transformar o Checklist de CS de uma lista simples para um **plano de sucesso temporal**, onde cada etapa tem prazo automático contado a partir da entrada do cliente, espaço para registrar o que aconteceu, e uma UX que destaca atrasos, próximos passos e histórico.

## O que muda na visão do usuário

**No card do cliente (aba Checklist):**
- Cada item exibe **data prevista** (ex.: "Vence em 7 dias" / "Atrasado há 3 dias" / "Concluído em 15/05") calculada a partir de uma data-base do cliente.
- Botão **"Registrar execução"** abre um pequeno painel inline para descrever **o que aconteceu** (notas em texto livre), data real de execução e quem participou.
- Itens concluídos mostram resumo da nota (com expandir).
- Filtros rápidos no topo: **Atrasados / Esta semana / Próximos / Concluídos**.
- Indicador visual: barra colorida na lateral do item (vermelho = atrasado, âmbar = vence em ≤ 3 dias, verde = ok, cinza = futuro).

**Na configuração do template (Configurações):**
- Cada item do template ganha campo **"Prazo (dias após entrada)"** — ex.: 7, 14, 30, 90.
- Campo opcional **"Cadência"**: única, semanal, quinzenal, mensal, trimestral (gera automaticamente as próximas N ocorrências).
- Campo opcional **"Categoria"** (Reunião, QBR, Report, Auditoria, Grow, Outro) com ícone/cor.
- Drag-and-drop para ordenar.
- Preview lateral mostrando como ficaria a timeline para um cliente novo.

**No mini indicador do board:**
- Mantém `3/12` mas adiciona ponto vermelho se houver item atrasado.

## Modelo de dados (alterações)

**`cliente_checklist_template`** — adicionar:
- `dias_offset` integer (prazo em dias após data-base; default 0)
- `cadencia` text (`unica` | `semanal` | `quinzenal` | `mensal` | `trimestral`; default `unica`)
- `ocorrencias` integer (qtd para cadências recorrentes; default 1)
- `categoria` text (`reuniao` | `qbr` | `report` | `auditoria` | `grow` | `outro`; default `outro`)

**`cliente_checklist_items`** — adicionar:
- `due_date` date (data prevista calculada na criação)
- `nota` text (descrição do que aconteceu na execução)
- `executado_em` date (data real de execução, opcional, default = `completed_at`)
- `categoria` text (espelha do template)

**Data-base do cliente:** usar `metadata_clientes.data_inicio` quando existir; senão `created_at` do registro. Não há nova coluna no cliente.

## Lógica de geração

Ao aplicar template (criação automática ou botão manual):
1. Buscar data-base do cliente.
2. Para cada item do template:
   - Se `cadencia = unica`: criar 1 item com `due_date = data_base + dias_offset`.
   - Se recorrente: criar `ocorrencias` itens com offsets crescentes (ex.: semanal partindo de `dias_offset`, somando 7 dias por ocorrência), numerando o texto (`1ª Reunião Semanal`, `2ª Reunião Semanal`, …).
3. Persistir `categoria` e `position` sequencial.

## UI/UX detalhada

### Aba "Checklist" no card do cliente
```text
[Filtros: Todos | Atrasados (2) | Esta semana | Próximos | Concluídos]
[Progresso: ████░░░░ 4/12 (33%)]

[●] 1ª Reunião Semanal              📅 Vence em 7 dias    [Registrar]
    └ Categoria: Reunião

[✓] Kickoff                          ✅ Concluído 02/05
    Nota: "Cliente alinhou objetivos Q2, decidiu focar em ..."  [expandir]

[●] QBR                              ⚠ Atrasado há 3 dias  [Registrar]
```

### Painel "Registrar execução" (inline, abre abaixo do item)
- Textarea para nota (markdown simples / mention).
- Date picker para data real (default = hoje).
- Botão "Concluir e salvar".
- Cancelar fecha sem alterar.

### Configuração do template
Tabela com colunas: ordem · texto · categoria (badge) · prazo (dias) · cadência · ações. Drag handle à esquerda. Linha de adição rápida no rodapé com todos os campos.

## Componentes / arquivos

**Novos**
- `src/components/clientes/detail/ClienteChecklistItemRow.tsx` — linha rica com badges, prazo e painel de registro.
- `src/components/clientes/detail/ClienteChecklistFilters.tsx` — filtros + contadores.
- `src/components/clientes/detail/RegistrarExecucaoPanel.tsx` — formulário inline (nota + data).
- `src/lib/checklistDates.ts` — helpers `computeDueLabel`, `getDueStatus`, `expandTemplate`.

**Editados**
- `src/components/clientes/detail/ClienteChecklistSection.tsx` — usa novos componentes, filtros, agrupamento.
- `src/components/clientes/ClienteChecklistTemplateConfig.tsx` — campos de offset, cadência, categoria; preview.
- `src/hooks/useClienteChecklist.ts` — `useApplyDefaultChecklistToCliente` passa a calcular `due_date` e expandir cadências; `useToggleClienteChecklistItem` aceita `nota` e `executado_em`.
- `src/hooks/useClienteChecklistTemplate.ts` — CRUD com novos campos.
- `src/components/clientes/board/BoardCard.tsx` — adicionar ponto de alerta se houver atrasados (já recebe `useClientesChecklistCounts`; estender para também retornar `overdue_count`).
- `src/hooks/useClientesChecklistCounts.ts` — incluir contagem de atrasados.

## Detalhes técnicos

- Migração SQL adiciona colunas com defaults (não quebra dados existentes; itens antigos ficam sem `due_date`, exibidos como "sem prazo").
- Cálculo de `due_date` feito no client (TypeScript) ao aplicar template — evita trigger e mantém lógica visível.
- `categoria` mapeada para cor/ícone num único objeto em `checklistDates.ts` (`reuniao`→azul/Calendar, `qbr`→roxo/BarChart, `report`→âmbar/FileText, `auditoria`→vermelho/ShieldCheck, `grow`→verde/TrendingUp).
- `RegistrarExecucaoPanel` reaproveita `Textarea` + `Calendar` (popover) já existentes; sem novas dependências.
- Filtros derivam do array em `useMemo`, sem requery.
- Padrão Radix: nenhum dropdown novo necessário; popover do calendar usa `onCloseAutoFocus={(e)=>e.preventDefault()}` (já é regra do projeto).

## Itens fora deste escopo (confirmar depois)

- Notificações automáticas de itens atrasados (entra na próxima iteração se quiser).
- Edição em massa de prazos.
- Exportar plano de sucesso em PDF.

## Próximo passo após aprovação

Antes de codar, vou pedir que você me envie a **lista exata de etapas do seu processo de CS** com:
- Nome
- Categoria
- Prazo em dias após entrada (ex.: 7, 14, 30…)
- Cadência (única / semanal / quinzenal / mensal / trimestral) e quantas ocorrências

Assim eu já populo o template padrão direto no banco.
