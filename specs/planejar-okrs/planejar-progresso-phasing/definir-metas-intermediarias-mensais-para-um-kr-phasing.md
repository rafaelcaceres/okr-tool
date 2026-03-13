Com certeza! Aqui está a especificação de desenvolvimento para a história de usuário "Definir metas intermediárias mensais para um KR (phasing)", criada com base no contexto fornecido.

---

# Definir Metas Intermediárias Mensais para um Key Result (Phasing)

## Descricao
Como um Líder de Franquia, eu quero poder quebrar a meta final de um Key Result numérico em metas intermediárias mensais. Isso me permitirá criar um plano de progresso (phasing) ao longo do período (e.g., trimestre), para que eu possa comparar o progresso realizado com o planejado de forma mais precisa e identificar desvios rapidamente.

## Regras de Negocio
1.  **Aplicabilidade:** O planejamento de metas intermediárias (phasing) só se aplica a Key Results (KRs) cujo tipo de medida é **numérico** (e.g., aumentar de X para Y). Não se aplica a KRs baseados em marcos (milestones).
2.  **Consistência da Meta:** A soma de todas as metas mensais planejadas deve ser exatamente igual ao valor total da meta do Key Result para o período.
    *   Exemplo: Se um KR tem como meta aumentar o número de pacientes de 100 (valor inicial) para 150 (valor alvo), a meta total é de 50 pacientes. A soma das metas mensais (e.g., para Q3: Julho + Agosto + Setembro) deve ser igual a 50.
3.  **Período:** As metas intermediárias são definidas para cada mês dentro do período de validade do OKR (e.g., um KR do 3º trimestre terá metas para Julho, Agosto e Setembro).
4.  **Valores Válidos:** Os valores inseridos para as metas mensais devem ser números não negativos.
5.  **Atualização da Meta Principal:** Se o valor alvo de um KR for alterado após o phasing já ter sido definido, o phasing existente se torna inválido. O sistema deve alertar o usuário e exigir que a distribuição das metas mensais seja reajustada para corresponder ao novo total.
6.  **Edição:** O usuário pode editar a distribuição das metas mensais a qualquer momento, desde que a nova distribuição continue respeitando a Regra de Negócio #2.
7.  **Estado Padrão:** Um novo KR numérico não possui um phasing definido por padrão. O planejamento é uma ação explícita do usuário.

## Criterios de Aceitacao
*   **Dado** que estou criando ou editando um Key Result do tipo "numérico" com uma meta total definida (e.g., aumentar em 100 unidades),
    **Quando** eu acesso a funcionalidade de "Planejar Progresso" (Phasing),
    **Então** o sistema exibe campos de entrada para cada mês do período correspondente ao KR.

*   **Dado** que estou na tela de planejamento de progresso para um KR com meta total de 100 unidades para um trimestre (3 meses),
    **Quando** eu preencho as metas mensais com valores cuja soma é 100 (e.g., 30, 30, 40),
    **Então** o sistema permite salvar o planejamento com sucesso e o associa ao KR.

*   **Dado** que estou na tela de planejamento de progresso para um KR com meta total de 100 unidades,
    **Quando** eu tento salvar com metas mensais cuja soma é diferente de 100 (e.g., 30, 30, 30),
    **Então** o sistema exibe uma mensagem de erro clara informando que "A soma das metas mensais deve ser igual à meta total do KR" e não permite salvar.

*   **Dado** que estou visualizando os detalhes de um Key Result do tipo "marco" (milestone),
    **Então** a opção de "Planejar Progresso" (Phasing) não deve estar visível ou deve estar desabilitada.

*   **Dado** que um KR numérico possui um phasing já salvo (e.g., meta de 100, com phasing 30, 30, 40),
    **Quando** eu edito a meta total do KR para 120,
    **Então** o sistema deve sinalizar que o phasing existente está inválido e me guiar para a tela de planejamento para que eu ajuste a distribuição.

## Casos Limite
*   **Meta Total Zero:** Se um KR tiver uma meta de progresso igual a zero (valor inicial igual ao valor alvo), a tela de phasing deve exigir que todos os valores mensais também sejam zero.
*   **Entrada de Dados Inválidos:** Se o usuário tentar inserir valores não numéricos (e.g., "abc") ou negativos nos campos de metas mensais, o sistema deve impedir a entrada ou exibir uma validação em tempo real, não permitindo o salvamento.
*   **Mudança do Período do OKR:** Se o período de um OKR (e.g., de Q3 para Q4) for alterado, qualquer phasing mensal previamente definido para os meses antigos (Jul, Ago, Set) deve ser descartado, e o usuário precisará definir um novo para os novos meses (Out, Nov, Dez).

## Fluxos Alternativos
*   **Distribuição Linear Automática:**
    *   **Dado** que estou na tela de planejamento de progresso,
    *   **Quando** eu clico na opção "Distribuir Linearmente",
    *   **Então** o sistema calcula e preenche automaticamente as metas mensais, dividindo a meta total do KR igualmente pelo número de meses no período. Quaisquer frações resultantes da divisão devem ser tratadas de forma consistente (e.g., adicionando o resto ao último mês).

*   **Cancelamento da Edição:**
    *   **Dado** que estou editando um phasing existente ou criando um novo,
    *   **Quando** eu clico em "Cancelar" ou fecho a tela sem salvar,
    *   **Então** as alterações que eu fiz são descartadas e o sistema mantém o último estado salvo do phasing (ou nenhum, se era a primeira vez).