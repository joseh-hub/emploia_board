# Premium Kanban – Diretrizes para novos boards

Este documento descreve o padrão visual **Premium Dark Mode (Zinc)** usado nos boards de Tarefas, Projetos, Clientes e CustomBoard. Ao criar um novo board, use estas regras para manter consistência em toda a aplicação.

## Regras de isolamento (obrigatórias)

- **Não alterar** lógica de negócio, hooks, data fetching ou drag-and-drop.
- **Apenas** classes Tailwind e estrutura JSX (divs/spans, ordem de elementos). Handlers e props devem permanecer iguais.
- Reutilize o arquivo de tokens `src/styles/premium-zinc.ts` para evitar divergência.

## Checklist de classes por área

### TopBar

- Use `TopBar` com `variant="premiumZinc"` para título, search e barra em estilo zinc.
- Exemplo: `<TopBar title="Meu Board" variant="premiumZinc" showSearch ... />`

### Filtros / Popovers / Dropdowns

- Trigger de filtro: `premiumZinc.selectTrigger` → `bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800`
- Conteúdo do popover: `premiumZinc.popoverContent` → `bg-zinc-900 border-zinc-800`
- Badge de contagem: `premiumZinc.badgeCount` ou `bg-zinc-900 border border-zinc-800 text-zinc-400`

### Toggle de visualização (Board / Lista ou Cards)

- Container: `premiumZinc.toggleGroup` → `bg-zinc-900 border-zinc-800`
- Botão ativo: `premiumZinc.toggleActive` → `bg-zinc-800 text-zinc-100 hover:bg-zinc-700`
- Botão inativo: `premiumZinc.toggleInactive` → `text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200`

### Board (scroll e botões)

- Gradiente esquerdo: `premiumZinc.scrollGradientLeft` → `bg-gradient-to-r from-zinc-950 to-transparent`
- Gradiente direito: `premiumZinc.scrollGradientRight` → `bg-gradient-to-l from-zinc-950 to-transparent`
- Botão de scroll: `premiumZinc.scrollButton` → `bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800`

### Coluna

- Container: `bg-zinc-950/50 border border-zinc-800/50 rounded-xl border-t-2` com `style={{ borderTopColor: column.color }}`
- Drag-over: `ring-2 ring-indigo-500/50 bg-indigo-500/5`
- **Não** usar barra grossa (`h-1.5`) separada; a cor da coluna vai no `border-t-2`.

### Cabeçalho da coluna

- Borda inferior: `border-b border-zinc-800/50`
- Título: `text-zinc-300 font-semibold text-sm tracking-wider`
- Badge de contagem: `bg-zinc-900 border border-zinc-800 text-zinc-400`
- Dropdown trigger: `text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200`
- Conteúdo do dropdown: `bg-zinc-900 border-zinc-800`
- Input ao editar nome: `bg-zinc-950 border-zinc-800 text-zinc-300`

### Card do item

- Base: `bg-zinc-900 border border-zinc-800/50 rounded-xl`
- Hover: `hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20`
- Título: `text-zinc-100 font-medium`
- Texto secundário: `text-zinc-400 text-sm`
- Footer/divisor: `border-t border-zinc-800/50`
- Avatares: `bg-zinc-700 text-zinc-300`

### Indicador de prioridade/status no card

- Use um **dot** ao lado do título (`w-2 h-2 rounded-full`) com classe por nível (ex.: `bg-red-500`, `bg-amber-500`, `bg-sky-500`, `bg-zinc-600`), **não** barra lateral.

### Barra de progresso (checklist)

- Track: `h-1.5 rounded-full bg-zinc-800`
- Fill: `bg-indigo-500/80`
- Label: `text-zinc-500 text-xs` (ex.: "1/3")

### Tags no card

- Fundo e borda com baixa opacidade: ex. `backgroundColor: \`${tag.color}18\``, `borderColor: \`${tag.color}30\``

### Empty state da coluna

- Texto: `text-zinc-600 text-sm`
- Círculo: `border-2 border-dashed border-zinc-800`

### Botão “Nova Coluna”

- Normal: `bg-zinc-900/30 border border-dashed border-zinc-800 text-zinc-400 hover:bg-zinc-900/50 hover:border-zinc-700`
- Card ao adicionar: `bg-zinc-900 border border-zinc-800/50`
- Input: `bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-500`

## Snippet de referência (uso do `premium-zinc.ts`)

```tsx
import { premiumZinc } from "@/styles/premium-zinc";
import { cn } from "@/lib/utils";

// Exemplo: coluna
<div
  className={cn(
    "min-w-[300px] max-w-[300px] flex flex-col rounded-xl border border-zinc-800/50 border-t-2",
    "bg-zinc-950/50",
    isDragOver && premiumZinc.columnDragOver
  )}
  style={{ borderTopColor: column.color }}
>
  {/* header, list, empty state, add button */}
</div>

// Exemplo: card
<Card
  className={cn(
    "border border-zinc-800/50 bg-zinc-900 rounded-xl",
    premiumZinc.cardHover
  )}
>
  ...
</Card>
```

## Onde está implementado

- **Tarefas**: `src/pages/Tarefas.tsx` + `src/components/tarefas/board/*`
- **Projetos**: `src/pages/Projetos.tsx` + `src/components/projetos/board/*`
- **Clientes**: `src/pages/Clientes.tsx` + `src/components/clientes/board/*`
- **CustomBoard**: `src/pages/CustomBoard.tsx` + `src/components/custom-board/*`

Tokens centralizados: `src/styles/premium-zinc.ts`.
