# Plano de Implementação - OKR Tool

## Contexto

O OKR Tool é uma aplicação para gestão de Objetivos e Key Results com Next.js 16 + Convex. Já existe um CRUD básico de objetivos e KRs com dashboard simples. As specs em `specs/` definem 30 funcionalidades organizadas em 3 áreas.

**Prioridades do cliente:**
- **Planejar** → Interface simples (uso interno da consultoria, ~2 usuários). Visualização limpa sem gráficos. Edição livre sem bloqueios de status.
- **Acompanhar Progresso** → Boa qualidade mas simples (~8 líderes). Apenas atualização de valores dos KRs, vinculado a ciclos ATIVO/FINALIZADO.
- **Relatórios** → Devem brilhar, ser o melhor possível (showpiece do produto, muitos visualizadores). Gráficos e análise detalhada ficam aqui.

**Estrutura de navegação (3 áreas):**
- `/planejamento` — CRUD completo de OKRs, ciclos, franquias, membros
- `/progresso` — Atualização de KRs por líderes
- `/relatorios` — Dashboards e relatórios com gráficos

---

## Fase 0: Schema e Refatoração Base ✅

**Objetivo:** Evoluir o schema Convex para suportar todas as funcionalidades.

### O que foi implementado

- **`convex/schema.ts`** — Reescrito com 8 tabelas: `cycles`, `franchises`, `objectives`, `keyResults`, `phasing`, `progressEntries`, `comments`, `milestones`. Validators exportados (`cycleStatus`, `objectiveStatus`, `measurementType`, `direction`) para reuso.
- **`convex/objectives.ts`** — Query `getObjectives` aceita `cycleId` opcional para filtro. Mutation `createObjective` aceita `cycleId`/`franchiseId` e valida unicidade de título por franquia+ciclo. `deleteObjective` bloqueia deleção se algum KR tem `hasProgress=true` e faz cascade delete de phasing/milestones. Nova mutation `updateObjectiveDescription` com validação de 500 chars e status do ciclo.
- **`convex/keyResults.ts`** — `createKeyResult` aceita `measurementType`, `initialValue`, `direction`, `currency` (com defaults para retrocompatibilidade). `updateKeyResultProgress` agora cria `progressEntry` e seta `hasProgress=true`. `deleteKeyResult` bloqueia se `hasProgress=true`. Cálculo de progresso reescrito para suportar `initialValue` e direção `DECREASING`.
- **`convex/helpers.ts`** — Funções `datesOverlap`, `validateCycleNameUnique`, `validateCycleNoOverlap`.
- **`objectives` (schema):** campos `cycleId` e `franchiseId` como `v.optional()` (retrocompatível), `description` permanece optional, status `LATE` adicionado. Índices: `by_cycle`, `by_franchise_cycle`.
- **`keyResults` (schema):** campos `initialValue`, `measurementType`, `direction`, `currency`, `externalLink`, `hasProgress` adicionados.

---

## Fase 1: Planejar — Ciclos de Planejamento ✅

**Objetivo:** CRUD completo de ciclos. Interface funcional e simples.

### O que foi implementado

**Backend (`convex/cycles.ts`):**
- Queries: `getCycles`, `getCyclesByStatus`, `getActiveCycle`, `getCycle`
- Mutations: `createCycle` (valida datas, nome único, sem sobreposição), `updateCycle` (mesmas validações excluindo o próprio ciclo), `activateCycle` (só ciclos finalizados, máx 1 ativo), `closeCycle` (só ciclos ativos), `deleteCycle` (só ciclos em planejamento sem objetivos)

**Backend (`convex/franchises.ts`):**
- Query `getFranchises`, mutation `createFranchise` (nome único)

**Frontend:**
- `src/app/dashboard/ciclos/page.tsx` — Página de ciclos com header e botão de criação
- `src/components/cycles/cycle-list.tsx` — Tabela com nome, período (formatado com date-fns pt-BR), badge de status colorido por tipo, botões de editar/excluir condicionais por status
- `src/components/cycles/create-cycle-dialog.tsx` — Dialog com form (nome, data início, data término), validação Zod incluindo `endDate > startDate`, mensagens de erro do backend exibidas via toast
- `src/components/cycles/edit-cycle-dialog.tsx` — Dialog pré-preenchido com dados do ciclo, mesmas validações

**Navegação (`src/app/dashboard/layout.tsx`):**
- Reescrito com nav horizontal: links "Objetivos" e "Ciclos" com indicador de rota ativa via `usePathname()`

**Dependências instaladas:** `date-fns`

**Componentes shadcn adicionados:** `select`, `badge`, `separator`, `table`

**Verificação:** Lint 0 erros, 10/10 testes passando

---

## Fase 2: Planejar — Objetivos e Key Results Completos ✅

**Objetivo:** Todas as regras de negócio das specs de planejamento.

### O que foi implementado

**Backend:**
- **`convex/objectives.ts`** — Nova mutation `updateObjective` (título max 250 chars, descrição max 500, validação de unicidade por franquia+ciclo, bloqueio em ciclo encerrado)
- **`convex/keyResults.ts`** — Nova mutation `updateKeyResult` (título, meta, valor inicial, direção, moeda, link externo com validação URL; bloqueia alterações estruturais se `hasProgress=true`). Corrigido tipo de `recalculateObjectiveProgress` para usar `MutationCtx`
- **`convex/milestones.ts`** — CRUD completo: `getMilestones`, `createMilestone` (valida tipo MILESTONE), `updateMilestone`, `toggleMilestone` (recalcula progresso do KR e objetivo automaticamente, cria `progressEntry`), `deleteMilestone` (bloqueia se KR tem progresso)

**Frontend — Componentes novos:**
- `src/components/objectives/edit-objective-dialog.tsx` — Edição de título e descrição com contador de caracteres (500 max), validação Zod
- `src/components/key-results/edit-key-result-dialog.tsx` — Edição completa com campos condicionais por tipo de medida, campos estruturais desabilitados quando há progresso registrado

**Frontend — Componentes atualizados:**
- `src/components/objectives/create-objective-dialog.tsx` — Reescrito: seletores de ciclo (filtra encerrados) e franquia via `useQuery`, textarea com contador 500 chars, título max 250, tudo em PT-BR
- `src/components/key-results/create-key-result-dialog.tsx` — Reescrito: seletor de tipo de medida (Numérico/Percentual/Financeiro/Marco), campos condicionais (valor inicial/meta para não-milestone/não-percentual, moeda para financeiro, unidade para numérico), seletor de direção (Crescente/Decrescente), campo de link externo com validação URL
- `src/components/objectives/objective-list.tsx` — PT-BR completo (labels de status traduzidos, textos), botão de editar (EditObjectiveDialog), diálogo de confirmação de exclusão (AlertDialog), progress bar com cap em 100%
- `src/components/key-results/key-result-list.tsx` — Reescrito: exibição por tipo de medida com badges (Numérico/Percentual/Financeiro/Marco), formatação de valores com símbolo de moeda, badge "Decrescente", link externo clicável, botão de editar, diálogo de confirmação de exclusão, barra de progresso visual com percentual
- `src/app/dashboard/page.tsx` — Seletor de ciclo para filtrar objetivos, PT-BR completo

**Componentes shadcn adicionados:** `textarea`, `alert-dialog`

**Testes atualizados:** 3 arquivos de teste reescritos para PT-BR e nova estrutura de componentes (mocks de EditObjectiveDialog, EditKeyResultDialog, useQuery para ciclos/franquias)

**Verificação:** Lint 0 erros, 10/10 testes passando

---

## Fase 3: Planejar — Phasing e Finalização ✅

**Objetivo:** Metas mensais e workflow de finalização do plano.

### O que foi implementado

**Backend (`convex/phasing.ts`):**
- Query `getPhasing` retorna todas as entradas de phasing de um KR
- Mutation `savePhasing` com validações: tipo não-MILESTONE, soma = meta total, valores não negativos, ciclo em PLANEJAMENTO
- Mutation `deletePhasing` com verificação de status do ciclo

**Backend (`convex/cycles.ts`):**
- Nova mutation `finalizeCycle`: valida ≥1 objetivo, cada objetivo com ≥1 KR, cada KR não-MILESTONE com phasing definido. Transiciona PLANEJAMENTO → FINALIZADO

**Backend — Guards de finalização:**
- `convex/objectives.ts`: `createObjective`, `updateObjective`, `updateObjectiveDescription`, `deleteObjective` bloqueiam quando ciclo não está em PLANEJAMENTO
- `convex/keyResults.ts`: `createKeyResult`, `updateKeyResult`, `deleteKeyResult` bloqueiam quando ciclo não está em PLANEJAMENTO

**Frontend — Componentes novos:**
- `src/components/phasing/phasing-editor.tsx` — Dialog com editor tabular (1 input por mês do ciclo), botão "Distribuir Linearmente", validação de soma em tempo real, feedback visual verde/vermelho
- `src/components/phasing/phasing-chart.tsx` — Recharts `LineChart` com valores cumulativos, linha de referência pontilhada na meta, tooltip interativo. Mensagem de fallback quando sem phasing
- `src/components/cycles/finalize-plan-button.tsx` — AlertDialog de confirmação, exibe erros de validação individuais via toast

**Frontend — Componentes atualizados:**
- `src/components/cycles/cycle-list.tsx` — Botões de "Finalizar Plano", "Ativar" e "Encerrar" condicionais por status do ciclo
- `src/components/key-results/key-result-list.tsx` — Integração com PhasingEditor (botão para KRs não-MILESTONE) e PhasingChart inline. Botões de editar/excluir condicionais ao status do ciclo
- `src/components/objectives/objective-list.tsx` — Fetch do ciclo via `getCycle`, botões de editar/excluir e "Adicionar KR" condicionais ao status PLANEJAMENTO. Passa dados do ciclo para KeyResultList

**Dependências instaladas:** `recharts`

**Verificação:** Lint 0 erros, 10/10 testes passando

---

## Fase 4: Acompanhar — Progresso e Status ✅

**Objetivo:** Lançamento de progresso, cálculo de saúde dos KRs, visão detalhada.

### O que foi implementado

**Backend (`convex/keyResults.ts`):**
- Nova query `getKeyResultsWithHealth` que retorna KRs com `health` computado (ON_TRACK, AT_RISK, LATE, NOT_STARTED, COMPLETED)
- Função `computeKrHealth` compara `currentValue` com phasing cumulativo do mês atual. Verde: ≥100% do planejado, Amarelo: 85-99%, Vermelho: <85%. Lógica invertida para KRs decrescentes
- Função `deriveObjectiveStatus` implementa "worst prevails" — status do objetivo = pior saúde entre seus KRs
- `recalculateObjectiveProgress` agora auto-calcula e persiste `status` do objetivo baseado na saúde dos KRs

**Backend (`convex/progressEntries.ts`):**
- Query `getProgressEntries` retorna histórico de atualizações por KR em ordem decrescente

**Frontend — Componentes novos:**
- `src/components/key-results/kr-status-badge.tsx` — Badge colorido de saúde (Em Dia/Em Risco/Atrasado/Não Iniciado/Concluído)
- `src/components/key-results/update-progress-dialog.tsx` — Dialog de lançamento de progresso com input condicional: numérico para NUMERIC/FINANCIAL, slider 0-100 para PERCENTUAL, checklist de marcos para MILESTONE
- `src/components/key-results/kr-detail-view.tsx` — Dialog de detalhes do KR com progresso visual (inicial/atual/meta), lista de marcos (para MILESTONE), e histórico de atualizações com data/hora

**Frontend — Componentes atualizados:**
- `src/components/phasing/phasing-chart.tsx` — Adicionada linha "Real" (verde) ao gráfico comparando progresso real vs planejado, com dados agregados por mês das `progressEntries`. Legenda dinâmica quando há dados reais
- `src/components/key-results/key-result-list.tsx` — Usa `getKeyResultsWithHealth` para exibir badges de saúde. Botão de atualizar progresso e detalhes visíveis em ciclos ativos. Barra de progresso colorida por saúde (verde/amarelo/vermelho)
- `src/components/objectives/objective-list.tsx` — Barra de progresso colorida pelo status do objetivo (reflete saúde dos KRs)

**Componentes shadcn adicionados:** `slider`, `checkbox`

**Verificação:** Lint 0 erros, 10/10 testes passando

---

## Fase 4.5: UX — Página de Detalhe do Objetivo ✅

**Objetivo:** Desafogar os cards do dashboard, criando uma página dedicada para cada objetivo.

### O que foi implementado

**Backend (`convex/objectives.ts`):**
- Nova query `getObjective(id)` — retorna um único objetivo por ID

**Frontend — Arquivos novos:**
- `src/app/dashboard/objectives/[objectiveId]/page.tsx` — Rota dinâmica Next.js App Router, extrai `objectiveId` dos params e renderiza `ObjectiveDetail`
- `src/components/objectives/objective-detail.tsx` — Página completa do objetivo: header com título grande, badge de status, descrição, nome do ciclo, botões de editar/excluir (se editável). Barra de progresso geral. Seção de Key Results com `CreateKeyResultDialog` (se editável) e grid de `KeyResultCard`
- `src/components/key-results/key-result-card.tsx` — Card expandido para um KR com: título/badges, descrição, valores inicial→atual→meta, barra de progresso colorida por saúde, lista de marcos (MILESTONE), gráfico planejado vs real (PhasingChart visível por padrão), histórico de atualizações recentes (últimas 5), todos os botões de ação com espaço adequado

**Frontend — Arquivos modificados:**
- `src/components/objectives/objective-list.tsx` — Simplificado para cards resumo clicáveis: título (com hover azul), badge de status, barra de progresso, seta chevron. Remove: descrição, KeyResultList inline, edit/delete buttons. Card com `<Link>` para `/dashboard/objectives/[id]`. Card dashed "Novo Objetivo" para criação (se editável)
- `src/app/dashboard/page.tsx` — Removido `CreateObjectiveDialog` do header (agora está dentro do grid de cards)
- `src/app/dashboard/layout.tsx` — Ajustado `isActive` para que `/dashboard/objectives/*` mantenha "Objetivos" ativo na nav

**Layout dos KRs:** Grid `md:grid-cols-2` — 2 KRs por linha no desktop, 1 no mobile

**Verificação:** Lint 0 erros, 10/10 testes passando

---

## Fase 5: Acompanhar — Comentários e Decisões ✅

**Objetivo:** Sistema de comentários nos KRs com decisões registradas.

### O que foi implementado

**Backend (`convex/comments.ts`):**
- Query `getComments` paginada (cursor-based com `paginationOptsValidator`, ordem decrescente)
- Query `getCommentCount` para badge de contagem nos cards
- Mutations: `addComment` (valida KR existe, texto não vazio, max 500 chars), `editComment` (bloqueia se decisão registrada), `deleteComment` (bloqueia se decisão registrada), `toggleDecision` (toggle `isRecordedDecision` + `decisionMarkedAt`)

**Schema (`convex/schema.ts`):**
- Campo `decisionMarkedAt: v.optional(v.number())` adicionado à tabela `comments`

**Cascade delete:**
- `convex/objectives.ts` → `deleteObjective` agora deleta comments de cada KR
- `convex/keyResults.ts` → `deleteKeyResult` agora deleta comments do KR

**Frontend — Componentes novos:**
- `src/components/comments/add-comment-form.tsx` — Textarea controlada com contador X/500 (vermelho >450), botão "Comentar", toast de sucesso/erro
- `src/components/comments/comment-item.tsx` — Dois estados visuais: normal (edit/delete/marcar decisão) e decisão registrada (borda amber, badge "Decisão Registrada", data, sem edit/delete). Edição inline com textarea + Salvar/Cancelar. Label "(editado)" quando `updatedAt !== createdAt`. Confirmação AlertDialog para exclusão
- `src/components/comments/comment-list.tsx` — `usePaginatedQuery` com 20 itens iniciais, botão "Carregar mais", empty state em PT-BR

**Frontend — Componentes atualizados:**
- `src/components/key-results/kr-detail-view.tsx` — Dialog alargado (550→680px), conteúdo com scroll (`max-h-[75vh]`), seção de comentários com `AddCommentForm` + `CommentList` após separator
- `src/components/key-results/key-result-card.tsx` — Badge com contagem de comentários (ícone `MessageCircle` + número)

**Simplificações (sem auth):**
- Sem campo `authorName` — não há sistema de autenticação
- Qualquer usuário pode editar/excluir qualquer comentário
- Decisões registram apenas timestamp, não nome do usuário

**Verificação:** Lint 0 erros, 22/22 testes passando (12 novos)

---

## Fase 5.5: Reestruturação — 3 Áreas + Remoção de Guards ✅

**Objetivo:** Reorganizar a aplicação em 3 áreas de navegação (Planejamento, Progresso, Relatórios), remover todos os bloqueios de edição por status de ciclo, e simplificar a visualização de KRs no planejamento.

### O que foi implementado

**Backend — Schema:**
- **`convex/schema.ts`** — Nova tabela `members` (nome + createdAt, index `by_name`). Campo `responsibles: v.optional(v.array(v.id("members")))` adicionado a `keyResults`

**Backend — Novo arquivo:**
- **`convex/members.ts`** — Query `getMembers` (lista todos), mutation `createMember` (nome único, não vazio), mutation `deleteMember` (verifica se está associado a algum KR antes de permitir exclusão)

**Backend — Remoção de guards de status de ciclo:**
- **`convex/objectives.ts`** — Removidos guards de `createObjective`, `updateObjective`, `updateObjectiveDescription`, `deleteObjective`. Removido bloqueio de `hasProgress` no delete (frontend mostra aviso via AlertDialog)
- **`convex/keyResults.ts`** — Removidos guards de `createKeyResult`, `updateKeyResult`, `deleteKeyResult`. Removido bloqueio de `hasProgress` em campos estruturais (targetValue, initialValue, direction agora são sempre editáveis). Adicionado `responsibles` aos args de create/update
- **`convex/phasing.ts`** — Removidos guards de `savePhasing` e `deletePhasing`

**Backend — Ciclos com status livre:**
- **`convex/cycles.ts`** — Removido bloqueio de ENCERRADO em `updateCycle`. Removida restrição de PLANEJAMENTO-only em `deleteCycle`. Nova mutation `setCycleStatus(id, status)` permite definir qualquer status diretamente. `finalizeCycle` mantido como opção com validação

**Frontend — Navegação e rotas:**
- **`src/app/(areas)/layout.tsx`** — Novo layout compartilhado com nav de 3 áreas (Planejamento/Progresso/Relatórios) + sub-nav do planejamento (Objetivos/Ciclos/Franquias/Membros). Ícones lucide-react, indicador de rota ativa
- **`src/app/(areas)/planejamento/page.tsx`** — Lista de objetivos (movido de `/dashboard`)
- **`src/app/(areas)/planejamento/ciclos/page.tsx`** — Gestão de ciclos
- **`src/app/(areas)/planejamento/franquias/page.tsx`** — Gestão de franquias
- **`src/app/(areas)/planejamento/membros/page.tsx`** — Novo: cadastro de membros
- **`src/app/(areas)/planejamento/objetivos/[objectiveId]/page.tsx`** — Detalhe do objetivo
- **`src/app/(areas)/progresso/page.tsx`** — Atualização de KRs por líderes
- **`src/app/(areas)/relatorios/page.tsx`** — Índice de relatórios com seletor de ciclo e cards de franquias
- **`src/app/(areas)/relatorios/[franchiseId]/page.tsx`** — Relatório detalhado da franquia
- **`src/app/page.tsx`** — Redirect para `/planejamento`

**Frontend — Planejamento simplificado (sem gráficos):**
- **`src/components/objectives/objective-detail.tsx`** — Reescrito: substituiu grid de `KeyResultCard` por **tabela limpa** (Title | Tipo | Atual | Meta | Farol | Ações). Sem gráficos, sem histórico de progresso inline. Todos os botões de ação sempre visíveis (sem guards de isEditable/isActive)
- **`src/components/objectives/objective-list.tsx`** — Links atualizados de `/dashboard/objectives/` para `/planejamento/objetivos/`. Removidos guards de isEditable
- **`src/components/objectives/create-objective-dialog.tsx`** — Removido filtro de ciclos ENCERRADO
- **`src/components/key-results/edit-key-result-dialog.tsx`** — Removido `disabled={hasProgress}` de campos estruturais

**Frontend — Ciclos com status livre:**
- **`src/components/cycles/cycle-list.tsx`** — Substituídos botões condicionais por `<Select>` dropdown de status usando `setCycleStatus`. Sempre mostra editar/excluir. Mantém `FinalizePlanButton` para ciclos em PLANEJAMENTO

**Frontend — Componentes novos:**
- **`src/components/members/member-list.tsx`** — Tabela de membros com criação inline (Input + botão) e exclusão com AlertDialog
- **`src/components/progress/progress-update-view.tsx`** — View para líderes: filtro de ciclo (ATIVO/FINALIZADO) + filtro de franquia, lista agrupada por objetivo com KR título, atual/meta, farol e botão "Atualizar" (abre `UpdateProgressDialog`)

**Frontend — Relatórios (base funcional):**
- **`src/components/reports/franchise-report.tsx`** — Relatório da franquia com seletor de ciclo, objetivos como Card sections com progress bar e badge de status, grid de `KeyResultCard` com gráficos/phasing/histórico de progresso

**Testes atualizados:**
- `objective-list.test.tsx` — Loading state verificado por skeleton cards. Links atualizados para `/planejamento/objetivos/`. Removida asserção de badge IN_PROGRESS

**Verificação:** Lint 0 erros (1 erro pré-existente), 22/22 testes passando

---

## Fase 6: Relatórios — Relatório da Franquia (polimento) ✅

**Objetivo:** Evoluir o relatório base da Fase 5.5 para versão polida e profissional. Aqui é onde o produto brilha.

### O que foi implementado

**Backend (`convex/reports.ts`):**
- Query denormalizada `getFranchiseReport(franchiseId, cycleId, currentDate)` que retorna tudo em uma chamada: franquia, ciclo, objetivos com status, KRs com health/phasing/progressEntries/milestones/commentCount/decisionCount/responsibleNames, e resumo agregado de saúde

**Frontend — Componentes novos:**
- `src/components/reports/report-header.tsx` — Header polido com nome da franquia (bold grande), ciclo + período formatado, data de geração, seletor de ciclo, e "pills" de resumo de saúde (contagem por status com cores)
- `src/components/reports/report-filters.tsx` — Toggle-buttons coloridos para filtrar KRs por status de saúde (Em Dia/Em Risco/Atrasado/Concluído/Não Iniciado), lógica OR, botão "Limpar"
- `src/components/reports/kr-report-row.tsx` — Linha de KR estilo Sanofi: borda lateral colorida por saúde, título + badges, valores Inicial/Atual/Meta, barra de progresso colorida, mini `AreaChart` (~140×60px) planejado vs real, ícone "farol" grande (✓/!/✗), responsáveis, indicador de decisões/comentários
- `src/components/reports/objective-report-card.tsx` — Card de objetivo: título + badge + progresso %, barra de distribuição de saúde (segmentos coloridos), lista de `KrReportRow`, e painel "Highlights & Decisões" com decisões registradas nos KRs

**Frontend — Componente reescrito:**
- `src/components/reports/franchise-report.tsx` — Reescrito para usar `ReportHeader`, `ReportFilters`, `ObjectiveReportCard` e a query única `getFranchiseReport`. Filtro client-side por status de saúde com lógica OR, oculta objetivos sem KRs visíveis

**Verificação:** Lint 0 novos erros, 22/22 testes passando

---

## Fase 7: Relatórios — Dashboard C-Level ⭐

**Objetivo:** Visão consolidada executiva de todas as franquias.

### UX
- Grid de cards de franquia: nome, progresso consolidado (número grande), indicador de saúde, mini progress bar
- Barra de resumo no topo: total de franquias, contagem por saúde (X verdes, Y amarelos, Z vermelhos)
- Filtro de período (seletor de ciclo)
- Click no card → navega para relatório da franquia (Fase 6)

### Arquivos novos
- `src/app/(areas)/relatorios/c-level/page.tsx`
- `src/components/reports/c-level-dashboard.tsx`
- `src/components/reports/franchise-summary-card.tsx`
- `src/components/reports/c-level-header.tsx`
- Adicionar `getConsolidatedDashboard` em `convex/reports.ts`

**Tamanho: M** | Depende de: Fase 6

---


## Fase 9: Relatórios — Modo Apresentação ⭐

**Objetivo:** Visualização fullscreen focada em gráficos para reuniões.

### UX
- Fullscreen com fundo escuro, alto contraste (otimizado para projetores)
- Cada "slide" = 1 objetivo com seus KRs e gráficos grandes
- Navegação: setas (teclado ou botões) entre objetivos
- Breadcrumb: `Franquia > Objetivo N de M`
- ESC para sair
- Rota dedicada: `/relatorios/[franchiseId]/apresentacao`
- Sem controles de edição, sem sidebar, sem header — só conteúdo
- Transições suaves entre slides (CSS fade)

### Arquivos novos
- `src/app/(areas)/relatorios/[franchiseId]/apresentacao/page.tsx`
- `src/components/reports/presentation/presentation-mode.tsx`
- `src/components/reports/presentation/presentation-slide.tsx`
- `src/components/reports/presentation/presentation-nav.tsx`
- `src/components/reports/presentation/presentation-kr-chart.tsx`

**Tamanho: M** | Depende de: Fase 6

--

## Fase 8: Relatórios — Exportação PDF ⭐

**Objetivo:** PDF profissional com fidelidade visual.

### Abordagem técnica: `@react-pdf/renderer`
- PDF vetorial com paginação correta, headers/footers, texto selecionável
- Gráficos: Recharts renderiza SVG nativamente → extrair SVG string → injetar no componente `<Svg>` do react-pdf
- Resultado: gráficos vetoriais nítidos no PDF

### Conteúdo do PDF
- Header: logo, nome da franquia, ciclo, data de geração
- Corpo: mesma hierarquia do relatório web (objetivos → KRs)
- Footer: numeração de páginas
- Nome do arquivo: `Relatorio_[Franquia]_[Ciclo]_[YYYY-MM-DD].pdf`

### Arquivos novos
- `src/components/reports/pdf/franchise-report-pdf.tsx`
- `src/components/reports/pdf/pdf-objective-section.tsx`
- `src/components/reports/pdf/pdf-kr-row.tsx`
- `src/components/reports/pdf/pdf-header.tsx`
- `src/components/reports/pdf/pdf-footer.tsx`
- `src/components/reports/export-pdf-button.tsx`
- `src/lib/chart-to-svg.ts`

### Dependência nova: `@react-pdf/renderer`

**Tamanho: M** | Depende de: Fase 6

---

## Fora de Escopo (fase futura)

- **Autenticação e permissões** — sem Clerk/auth por enquanto. Qualquer usuário pode fazer tudo.
- **Integração com Jira** — só lançamento manual de progresso. Webhook/API externa fica para depois.

## Decisões Arquiteturais

1. **Status de saúde é computado, não armazenado.** Calculado nas queries Convex comparando valor atual com phasing do mês. Evita dados stale.

2. **Status do Objetivo = "worst prevails"** dos seus KRs. Computado na query.

3. **Progress entries são append-only.** Cada atualização cria um registro histórico + atualiza currentValue no KR. Fornece trilha de auditoria e dados para gráficos real vs planejado.

4. **Phasing usa valores acumulados.** Cada mês representa o total esperado até aquele mês, não o delta incremental. Simplifica comparação e renderização de gráficos.

5. **PDF com `@react-pdf/renderer` + SVG dos gráficos.** Produz PDFs vetoriais profissionais com paginação real, ao invés de screenshots com html2canvas.

6. **Modo apresentação é rota separada, não modal.** Permite compartilhamento via URL e comportamento fullscreen limpo.

7. **Sem guards de status de ciclo.** Todas as mutations permitem edição em qualquer status. Migração de planilha requer controle total. Status do ciclo é informativo, não restritivo.

8. **Delete com aviso, não bloqueio.** Quando um KR/objetivo tem progresso registrado (`hasProgress=true`), o frontend exibe aviso extra no AlertDialog, mas o backend não bloqueia a operação.

9. **Gráficos apenas nos Relatórios.** A área de Planejamento usa tabela limpa (título, tipo, atual, meta, farol, ações). Gráficos de phasing, progresso e análise ficam exclusivamente na área de Relatórios.

10. **Status do ciclo é livre.** Mutation `setCycleStatus` permite transição direta entre qualquer status (PLANEJAMENTO ↔ FINALIZADO ↔ ATIVO ↔ ENCERRADO). `finalizeCycle` com validação é mantido como opção, não obrigação.

## Dependências Novas

| Pacote | Uso |
|--------|-----|
| `recharts` | Gráficos (phasing, progresso, relatórios) |
| `@react-pdf/renderer` | Geração de PDF |
| `date-fns` | Manipulação de datas (ciclos, phasing) |

## Verificação

Após cada fase:
1. Rodar `npx vitest run` — todos os testes passando
2. Rodar `npm run lint` — sem erros
3. Testar manualmente no browser com `npm run dev` + `npx convex dev`
4. Para relatórios (Fases 6-9): verificar com dados reais de múltiplas franquias e ciclos
5. Para PDF (Fase 7): verificar fidelidade visual comparando tela vs PDF gerado
