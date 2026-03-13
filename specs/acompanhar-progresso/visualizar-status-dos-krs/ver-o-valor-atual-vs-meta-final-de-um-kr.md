Claro, aqui está a especificação completa para a história de usuário, utilizando o contexto fornecido e seguindo a estrutura solicitada.

---

# Visualizar Progresso de um Key Result

## Descricao
Como Líder de Franquia ou Líder Sênior, eu quero visualizar o valor atual de um Key Result (KR) em comparação com sua meta final, para que eu possa avaliar rapidamente seu desempenho, identificar desvios e comunicar o progresso de forma clara durante as reuniões de estratégia.

## Regras de Negocio
1.  Todo KR deve exibir claramente três valores: o valor inicial, o valor atual e o valor da meta.
2.  O progresso deve ser representado visualmente (ex: barra de progresso) e como um percentual.
3.  O cálculo do progresso percentual depende da direção da meta:
    *   **Aumentar valor:** `Progresso % = ((Valor Atual - Valor Inicial) / (Meta - Valor Inicial)) * 100`
    *   **Diminuir valor:** `Progresso % = ((Valor Inicial - Valor Atual) / (Valor Inicial - Meta)) * 100`
4.  O progresso percentual exibido deve ser limitado a 100%, mesmo que o valor atual ultrapasse a meta. Os valores numéricos (atual e meta) devem sempre refletir a realidade.
5.  Para KRs do tipo **Numérico**, a exibição deve incluir a unidade de medida (ex: "R$ 150.000 / R$ 200.000", "75/100 pacientes").
6.  Para KRs do tipo **Milestone** (marcos), o progresso é calculado pelo número de marcos concluídos sobre o total de marcos.
    *   A exibição deve ser no formato "X de Y concluídos".
    *   O cálculo percentual é: `Progresso % = (Marcos Concluídos / Total de Marcos) * 100`.
7.  Se o valor atual for inferior ao valor inicial (para uma meta de aumento), ou superior ao valor inicial (para uma meta de diminuição), o progresso é considerado 0%.
8.  A data da última atualização do "valor atual" deve estar visível para dar contexto sobre a atualidade da informação.

## Criterios de Aceitacao
*   **Cenário 1: Visualizar progresso de um KR numérico crescente**
    *   **Dado** que um KR tem Valor Inicial = 0, Meta = 200, e o Valor Atual é 50.
    *   **Quando** eu visualizo os detalhes deste KR.
    *   **Então** eu devo ver o valor "50 / 200", uma representação visual de 25% de progresso, e o texto "25% concluído".

*   **Cenário 2: Visualizar progresso de um KR numérico decrescente**
    *   **Dado** que um KR tem Valor Inicial = 10%, Meta = 4% (reduzir churn), e o Valor Atual é 7%.
    *   **Quando** eu visualizo os detalhes deste KR.
    *   **Então** eu devo ver o valor "7% / 4%", uma representação visual de 50% de progresso, e o texto "50% concluído".
    *   *(Cálculo: (10 - 7) / (10 - 4) = 3 / 6 = 0.5)*

*   **Cenário 3: Visualizar progresso de um KR baseado em milestones**
    *   **Dado** que um KR possui 5 milestones definidos no total.
    *   **E** 2 desses milestones foram marcados como "concluídos".
    *   **Quando** eu visualizo os detalhes deste KR.
    *   **Então** eu devo ver o texto "2 de 5 concluídos", uma representação visual de 40% de progresso, e o texto "40% concluído".

*   **Cenário 4: Visualizar KR que excedeu a meta**
    *   **Dado** que um KR tem Valor Inicial = 100, Meta = 150, e o Valor Atual é 170.
    *   **Quando** eu visualizo os detalhes deste KR.
    *   **Então** eu devo ver o valor "170 / 150", uma representação visual de 100% (completa), e o texto "100% concluído".

## Casos Limite
*   **KR recém-criado:**
    *   **Situação:** Um KR acaba de ser criado e seu valor atual é igual ao valor inicial.
    *   **Comportamento esperado:** O progresso deve ser exibido como 0%, e a representação visual deve estar vazia.

*   **Meta igual ao valor inicial:**
    *   **Situação:** Um KR é configurado com a Meta igual ao Valor Inicial.
    *   **Comportamento esperado:** O sistema deve indicar que a configuração é inválida. O progresso deve ser exibido como "N/A" (Não aplicável) para evitar uma divisão por zero.

*   **Progresso negativo:**
    *   **Situação:** Um KR de aumento (Inicial=50, Meta=100) tem seu Valor Atual reportado como 40.
    *   **Comportamento esperado:** O progresso deve ser exibido como 0%. Os valores numéricos "40 / 100" devem ser mostrados corretamente para indicar a regressão.

*   **KR do tipo milestone sem milestones definidos:**
    *   **Situação:** Um KR é definido como do tipo "Milestone", mas nenhum marco foi adicionado a ele.
    *   **Comportamento esperado:** O progresso deve ser exibido como "0 de 0 concluídos" e 0%.

## Fluxos Alternativos
*   **Visualizar KR sem permissão de acesso:**
    *   **Contexto:** Um usuário tenta visualizar os detalhes de um KR pertencente a uma franquia à qual ele não tem acesso.
    *   **Comportamento esperado:** O sistema não deve exibir os dados do KR. Uma mensagem de "Acesso negado" ou simplesmente a omissão do KR na listagem é esperada.

*   **KR com dados desatualizados:**
    *   **Contexto:** O usuário visualiza um KR cujo valor atual não é atualizado há um período de tempo considerado longo (ex: mais de 30 dias).
    *   **Comportamento esperado:** Além de exibir a data da última atualização, o sistema pode aplicar um destaque visual (ex: um ícone de alerta) para sinalizar que a informação pode estar desatualizada.