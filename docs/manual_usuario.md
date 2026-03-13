# Manual do Usuário - OKR Tool

Este documento descreve como utilizar a ferramenta de gestão de OKRs, detalhando os processos de criação de franquias, ciclos, objetivos e as regras de negócio que governam o sistema.

## 1. Visão Geral

O OKR Tool permite que a organização planeje, acompanhe e relate seus Objetivos e Resultados Chave (OKRs). O sistema é estruturado em torno de **Franquias** (unidades de negócio) e **Ciclos** (períodos de tempo, ex: trimestres).

## 2. Gestão de Franquias

As franquias representam as unidades organizacionais ou times.

*   **Criar Franquia:** Acesse o menu "Franquias" e clique em "Nova Franquia". Basta informar o nome.
*   **Visualização:** O dashboard consolida as informações por franquia, permitindo filtrar os objetivos específicos de cada unidade.

## 3. Ciclos de Planejamento

Os ciclos definem o período de vigência dos OKRs (ex: "Q3 2024"). Todo objetivo deve estar vinculado a um ciclo.

### Estados do Ciclo

Um ciclo passa por 4 fases distintas. As ações permitidas no sistema mudam rigorosamente conforme o estado atual do ciclo:

1.  **PLANEJAMENTO (Planning)**
    *   **O que é:** Estado inicial de criação e rascunho.
    *   **Permite:** Criar, editar e excluir Objetivos e Key Results. Definir metas mensais (Phasing).
    *   **Não permite:** Acompanhar progresso (lançar valores reais).
    *   **Ação de Transição:** "Finalizar Plano" (move para FINALIZADO).

2.  **FINALIZADO (Finalized)**
    *   **O que é:** O plano foi aprovado e está pronto para começar. É um estado de "congelamento" antes do início.
    *   **Permite:** Apenas visualização.
    *   **Não permite:** Nenhuma edição estrutural (criar/editar/excluir OKRs).
    *   **Ação de Transição:** "Ativar Ciclo" (move para ATIVO).

3.  **ATIVO (Active)**
    *   **O que é:** O ciclo está em andamento (vigente).
    *   **Permite:** Atualizar progresso dos KRs (Check-ins/Lançamentos).
    *   **Não permite:** Alterar a estrutura dos OKRs (metas, títulos, criar novos) para garantir a integridade do que foi combinado.
    *   **Restrição:** Apenas **um** ciclo pode estar ativo por vez no sistema.
    *   **Ação de Transição:** "Encerrar Ciclo" (move para ENCERRADO).

4.  **ENCERRADO (Closed)**
    *   **O que é:** O ciclo acabou.
    *   **Permite:** Apenas consulta histórica (Relatórios).
    *   **Não permite:** Nenhuma edição ou atualização de progresso.

### Regras para Finalizar um Ciclo
Para mover um ciclo de "Planejamento" para "Finalizado", o sistema realiza uma validação estrita. Você não conseguirá finalizar se:
*   O ciclo não tiver **pelo menos 1 Objetivo**.
*   Algum Objetivo não tiver **pelo menos 1 Key Result**.
*   Algum Key Result (do tipo Numérico, Percentual ou Financeiro) não tiver o **Planejamento Mensal (Phasing)** totalmente preenchido.

## 4. Definindo Objetivos e Key Results (OKRs)

⚠️ **Importante:** A criação e edição de OKRs só são permitidas quando o ciclo selecionado está em **PLANEJAMENTO**.

### Criando Objetivos
1.  Navegue até o Dashboard e selecione a Franquia e o Ciclo desejados.
2.  Clique no card "Novo Objetivo".
3.  Insira o Título, Descrição (opcional) e Data de Vencimento (opcional).
    *   *Restrição:* O título do objetivo deve ser único dentro daquela Franquia e Ciclo.

### Criando Key Results (KRs)
Dentro de um objetivo, você adiciona os resultados mensuráveis. O sistema suporta 4 tipos:

1.  **Numérico:** Para contagens absolutas (ex: "Atingir 1000 clientes", "Reduzir para 50 bugs").
2.  **Percentual:** Para metas de progresso relativo (0 a 100%).
3.  **Financeiro:** Para metas monetárias (permite definir símbolo da moeda, ex: R$, USD).
4.  **Marco (Milestone):** Para entregas binárias ou listas de tarefas (Checklist). Não possui curva de progresso gradual.

**Configurações do KR:**
*   **Direção:**
    *   *Crescente (Increasing):* Quanto maior o valor, melhor (ex: Receita).
    *   *Decrescente (Decreasing):* Quanto menor o valor, melhor (ex: Churn, Tempo de Resposta).
*   **Valores:** Defina o Valor Inicial e o Valor Meta (Target).

### Planejamento de Progresso (Phasing)
Para KRs que não são Marcos (Milestones), é **obrigatório** definir as metas mensais antes de finalizar o plano.
1.  No card do KR, clique no ícone de gráfico ou "Planejar".
2.  O sistema exibe os meses do ciclo.
3.  Preencha quanto se espera atingir (valor acumulado) em cada mês.
4.  O sistema valida se a projeção faz sentido com a meta final.

## 5. Acompanhamento (Check-ins)

Quando o ciclo está **ATIVO**, a funcionalidade principal é o lançamento de resultados.

### Atualizando o Progresso
1.  Localize o KR no dashboard.
2.  Clique em "Atualizar Progresso" (ou interaja com o slider/checkbox direto no card).
3.  Insira o **valor atual total** alcançado até o momento.
4.  O sistema salva um registro histórico (quem, quando e quanto).

### Cálculo Automático de Saúde (Health)
O sistema calcula automaticamente a cor do status comparando o **Real vs. Planejado (Phasing)** para a data atual:

*   🟢 **Em Dia (On Track):** O realizado é ≥ 100% do planejado para o mês atual.
*   🟡 **Em Risco (At Risk):** O realizado está entre 85% e 99% do planejado.
*   🔴 **Atrasado (Late):** O realizado está abaixo de 85% do planejado.

*Nota:* Para KRs Decrescentes, a lógica é invertida (estar abaixo da meta planejada é o desejado).

**Status do Objetivo:** O status do Objetivo segue a regra do "Pior Prevalece" (*Worst Prevails*).
*   Se qualquer KR estiver 🔴 Atrasado, o Objetivo fica 🔴 Atrasado.
*   Se não houver atrasos mas houver 🟡 Risco, o Objetivo fica 🟡 Em Risco.
*   Só fica 🟢 Em Andamento se todos os KRs estiverem saudáveis.

## 6. Regras de Edição e Exclusão (Tabela de Permissões)

O sistema possui travas de segurança para evitar perda de dados ou inconsistências históricas.

| Ação | Quando é permitido? | Por que bloqueia? |
| :--- | :--- | :--- |
| **Criar/Editar Objetivo** | Apenas Ciclo em `PLANEJAMENTO` | Uma vez finalizado, o plano é um compromisso firmado. |
| **Excluir Objetivo** | Ciclo em `PLANEJAMENTO` **E** sem KRs com progresso | Não se pode apagar histórico de resultados já lançados. |
| **Criar/Editar KR** | Apenas Ciclo em `PLANEJAMENTO` | O plano não pode mudar durante a execução. |
| **Excluir KR** | Ciclo em `PLANEJAMENTO` **E** sem progresso | Se já houve check-in, o KR faz parte da história. |
| **Alterar Meta/Tipo do KR** | Apenas Ciclo em `PLANEJAMENTO` **E** sem progresso | Mudanças estruturais invalidariam os gráficos de progresso anteriores. |
| **Excluir Ciclo** | Apenas Ciclo em `PLANEJAMENTO` **E** sem Objetivos | Segurança para não apagar ciclos inteiros acidentalmente; deve-se esvaziar o ciclo antes. |
