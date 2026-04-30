## Objetivo

Transformar o template de checklist único em **três templates** (Cluster B, C e D) e popular cada um com o calendário de CS d0→d+365 que você passou. Quando o checklist for aplicado a um cliente, o sistema escolhe o template automaticamente baseado no campo `Tipo` do cliente em `metadata_clientes`.

## Como vai funcionar para o usuário

**Configurações → CS Checklist**
- Aparece um seletor de cluster no topo: `[Cluster B] [Cluster C] [Cluster D]`
- Cada aba mostra o template daquele cluster com seus itens (já populados pelo seu calendário)
- Editar/adicionar/remover itens é independente por cluster
- Itens condicionais (ex.: "AI Assessment se contratado", "Uísque se up-sell") aparecem com badge **Opcional** em cinza

**No card do cliente → Aplicar checklist padrão**
- Lê o campo `Tipo` do cliente
- Aplica automaticamente o template do cluster correspondente
- Se o cliente não tiver Tipo definido, mostra um seletor antes de aplicar
- Reuniões recorrentes são expandidas em ocorrências numeradas (1ª, 2ª, 3ª… Reunião Semanal) com `due_date` calculada

## Mudança de schema

**`cliente_checklist_template`** ganha:
- `cluster` text NOT NULL DEFAULT 'B' — `'B'`, `'C'` ou `'D'`
- `opcional` boolean NOT NULL DEFAULT false — marca itens condicionais
- Índice em `(cluster, position)`

**`cliente_checklist_items`** ganha:
- `opcional` boolean NOT NULL DEFAULT false — herdado do template para mostrar badge

Itens existentes ficam com `cluster='B'` (você já só tem 1 de teste).

## Conteúdo populado em cada cluster

A tabela abaixo mostra o que cada cluster recebe. Marquei com **(opc)** os condicionais.

```text
                                          B    C    D
Kick-off + alinhamento de metas           d0   d0   d0
Reunião Semanal (×3 nas semanas 1-3)      ×    ×    —     [semanal × 3]
Reunião Quinzenal Mês 1                   d+15 d+15 —
Onboarding check + dados mensais          d+30 d+30 —
Relatório assíncrono inicial              —    —    d+30
Reuniões Mês 2 (quinzenal × 2 / mensal)   ×2   ×1   —
Checkpoint mensal Mês 2                   d+60 d+60 —
Checkpoint trimestral Mês 3               d+90 d+90 d+90
1º QBR                                    d+90 d+90 d+90 (D = PDF/Loom)
Estudo de Nicho (entregue no QBR)         d+90 d+90 —
Reuniões Mês 4-5 (×2 cada)                ×4   ×4   —
Checkpoint mensal Mês 4                   d+120 d+120 —
Estudo de Concorrentes                    d+120 d+120 —
Checkpoint trimestral Mês 6               d+180 d+180 d+180
2º QBR + midyear review                   d+180 d+180 d+180 (D = PDF/Loom)
Roadmap de IA                             d+180 d+180 d+180 (opc)
Presente: Uísque                          d+180 —    —     (opc)
Reuniões Mês 7-8                          ×4   ×2   —
Checkpoint mensal Mês 7                   d+210 d+210 —
Checkpoint trimestral Mês 9               d+270 d+270 d+270
3º QBR                                    d+270 d+270 d+270 (D = PDF/Loom)
AI Assessment                             d+270 d+270 d+270 (opc)
Reuniões Mês 10-11                        ×4   ×2   —
Checkpoint mensal Mês 10                  d+300 d+300 —
Planejamento do aniversário               d+330 —    —
Checkpoint trimestral Mês 12              d+360 d+360 d+360
4º QBR + Aniversário                      d+360 d+360 d+360
```

Total estimado: **~22 itens em B**, **~17 em C**, **~7 em D**.

## Mudanças no código

**`src/lib/checklistDates.ts`**
- Adicionar `type Cluster = 'B' | 'C' | 'D'`
- `expandTemplate` passa a aceitar `opcional` e copiá-lo no expanded item

**`src/hooks/useClienteChecklistTemplate.ts`**
- `useClienteChecklistTemplate(cluster)` — query passa a filtrar por cluster
- `useAddTemplateItem` / `useUpdateTemplateItem` recebem `cluster` e `opcional`

**`src/hooks/useClienteChecklist.ts`**
- `useApplyDefaultChecklistToCliente` lê `metadata_clientes.Tipo`, mapeia para cluster (B/C/D — fallback B), busca template daquele cluster, expande e insere

**`src/components/clientes/ClienteChecklistTemplateConfig.tsx`**
- Adicionar `Tabs` (B / C / D) no topo, cada aba renderiza a mesma UI atual filtrada por cluster
- Adicionar checkbox/switch "Opcional" na linha de novo item e na linha de edição
- Mostrar badge cinza "Opcional" em itens marcados

**`src/components/clientes/detail/ClienteChecklistItemRow.tsx`**
- Mostrar badge "Opcional" antes do nome quando `opcional=true`

**`src/components/clientes/detail/ClienteChecklistSection.tsx`**
- Botão "Aplicar checklist padrão" mostra qual cluster vai usar (lido do cliente). Se não houver Tipo, abre um pequeno popover pedindo para escolher.

## Population dos itens

Feita via seed (SQL `INSERT`) logo após a migration do schema. Como hoje só existe 1 item de teste no template, vou apagar ele antes de popular para evitar duplicata.

## Fora do escopo

- Re-aplicar o novo template a clientes que já têm checklist gerado (eles continuam como estão; quem quiser refaz manualmente)
- Editor visual de "qual item vai pra qual cluster simultaneamente" — cada cluster é editado independentemente
- Notificação automática de itens próximos do prazo
