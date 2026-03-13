Claro, aqui está a especificação de desenvolvimento completa para a história de usuário, seguindo o formato solicitado e enriquecida com o contexto fornecido.

---

# Configurar o Tipo de Medida de um Key Result

## Descricao
Como um **Líder de Franquia**, ao criar ou editar um Key Result (KR), desejo selecionar o tipo de medida que será usado para acompanhar seu progresso. Isso garante que a forma de medição (ex: número de pacientes, R$ em vendas, % de conclusão) seja adequada e consistente, facilitando o acompanhamento, a interpretação dos resultados e o reporte para a liderança.

## Regras de Negocio
1.  Todo Key Result deve ter um, e apenas um, tipo de medida associado.
2.  Os tipos de medida disponíveis para seleção são:
    *   **Numérico**: Para acompanhar a mudança de um número absoluto (ex: aumentar de 100 para 500 pacientes).
    *   **Percentual**: Para acompanhar o progresso de 0% a 100%.
    *   **Financeiro**: Para acompanhar valores monetários (ex: aumentar o faturamento de R$ 1M para R$ 1.2M).
    *   **Marco (Milestone)**: Para acompanhar a conclusão de um conjunto de entregas ou tarefas binárias (concluído/não concluído).
3.  A seleção de um tipo de medida determina os campos necessários para definir a meta do KR:
    *   **Se Numérico**: Requer "Valor Inicial", "Valor Alvo" e um campo textual para "Unidade de Medida" (ex: "pacientes", "relatórios", "unidades").
    *   **Se Percentual**: O "Valor Inicial" é fixo em 0% e o "Valor Alvo" é fixo em 100%. Estes campos não devem ser editáveis pelo usuário.
    *   **Se Financeiro**: Requer "Valor Inicial", "Valor Alvo" e um campo para selecionar a "Moeda" (ex: R$, USD, EUR).
    *   **Se Marco**: Requer uma lista de marcos, onde cada marco é uma descrição textual. O progresso é calculado com base na proporção de marcos concluídos.
4.  Uma vez que um Key Result tenha seu primeiro registro de progresso lançado, o seu tipo de medida **não poderá** ser alterado. Isso garante a integridade histórica dos dados de acompanhamento.
5.  O tipo de medida padrão ao criar um novo Key Result deve ser "Numérico".
6.  Para os tipos Numérico e Financeiro, o "Valor Inicial" não pode ser maior que o "Valor Alvo".

## Criterios de Aceitacao
*   **Dado** que estou criando um novo Key Result
    **Quando** eu seleciono o tipo de medida "Numérico"
    **Então** o sistema deve exibir campos para "Valor Inicial", "Valor Alvo" e "Unidade de Medida".

*   **Dado** que estou criando um novo Key Result
    **Quando** eu seleciono o tipo de medida "Percentual"
    **Então** o sistema deve definir automaticamente o "Valor Inicial" como 0% e o "Valor Alvo" como 100%, e não permitir a edição destes valores.

*   **Dado** que estou criando um novo Key Result
    **Quando** eu seleciono o tipo de medida "Financeiro"
    **Então** o sistema deve exibir campos para "Valor Inicial", "Valor Alvo" e um campo para selecionar a "Moeda".

*   **Dado** que estou criando um novo Key Result
    **Quando** eu seleciono o tipo de medida "Marco"
    **Então** o sistema deve exibir uma interface que me permita adicionar, editar e remover múltiplos marcos textuais.

*   **Dado** um Key Result existente que já possui registros de progresso
    **Quando** eu tento editar este Key Result
    **Então** o campo para selecionar o "Tipo de Medida" deve estar desabilitado (bloqueado para edição).

## Casos Limite
*   **Troca de tipo antes de salvar**: Se um usuário selecionar o tipo "Numérico", preencher os valores de meta, e em seguida (antes de salvar) mudar o tipo para "Percentual", os valores preenchidos anteriormente (Valor Inicial, Valor Alvo, Unidade) devem ser descartados e os novos campos/regras correspondentes ao tipo "Percentual" devem ser aplicados.
*   **Valor inicial igual ao valor alvo**: O sistema deve permitir que o "Valor Inicial" seja igual ao "Valor Alvo" para os tipos Numérico e Financeiro. Isso pode representar um KR de manutenção ("manter X").
*   **Marcos sem descrição**: O sistema não deve permitir a criação de um marco sem uma descrição textual.
*   **Unidade de medida vazia**: O campo "Unidade de Medida" para o tipo Numérico é opcional. Se não for preenchido, o sistema deve apenas exibir os números sem um rótulo de unidade.

## Fluxos Alternativos
*   **Editar tipo de medida de um KR sem progresso**:
    *   **Dado** um Key Result existente que ainda **não possui** registros de progresso
    *   **Quando** eu edito o Key Result e altero seu tipo de medida (ex: de "Numérico" para "Marco")
    *   **Então** o sistema deve limpar quaisquer valores de meta anteriores e apresentar a nova interface de configuração correspondente ao tipo "Marco".

*   **Cancelamento da operação**:
    *   **Dado** que estou na tela de criação ou edição de um Key Result e já selecionei um tipo de medida
    *   **Quando** eu clico em "Cancelar" ou fecho a tela sem salvar
    *   **Então** nenhuma alteração no tipo de medida ou seus valores associados deve ser persistida.