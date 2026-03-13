Claro, aqui está a especificação de desenvolvimento para a história solicitada, utilizando o contexto fornecido.

---

# Visualizar Status Calculado de um Key Result

## Descrição
Para que Líderes de Franquia e Líderes Sêniores possam identificar rapidamente o andamento de um resultado-chave, o sistema deve calcular e exibir um status claro (ex: Em dia, Em risco, Atrasado) baseado na comparação entre o progresso realizado e o planejado para o período.

## Regras de Negocio
1.  O status de um KR é sempre calculado comparando o **Valor Realizado** com o **Valor Planejado** para o período de acompanhamento atual (ex: mês, trimestre).
2.  O sistema deve categorizar o status de um KR da seguinte forma:
    *   **Em dia (Verde):** Quando o `Valor Realizado` é igual ou superior a 100% do `Valor Planejado`.
    *   **Em risco (Amarelo):** Quando o `Valor Realizado` está entre 85% (inclusivo) e 100% (exclusivo) do `Valor Planejado`.
    *   **Atrasado (Vermelho):** Quando o `Valor Realizado` é inferior a 85% do `Valor Planejado`.
3.  Para KRs onde o objetivo é **diminuir** um valor (ex: reduzir o tempo de espera), a lógica é invertida:
    *   **Em dia (Verde):** `Valor Realizado` é igual ou inferior ao `Valor Planejado`.
    *   **Em risco (Amarelo):** `Valor Realizado` é superior ao `Valor Planejado`, mas não excede 115% do `Valor Planejado`.
    *   **Atrasado (Vermelho):** `Valor Realizado` é superior a 115% do `Valor Planejado`.
4.  Um KR que ainda não teve nenhum progresso reportado para o período deve ter o status **Não Iniciado**.
5.  O status deve ser exibido de forma proeminente, tanto textualmente (ex: "Em risco") quanto visualmente (ex: cor amarela), em todas as telas onde o KR for apresentado.
6.  O cálculo do status é automático e deve ser reavaliado sempre que o `Valor Realizado` de um KR for atualizado.

## Criterios de Aceitacao
*   **Cenário 1: KR Em dia**
    *   **Dado** que um KR tem um `Valor Planejado` de 100 pacientes para o período atual
    *   **Quando** o Líder de Franquia atualiza o `Valor Realizado` para 105
    *   **Então** o sistema deve exibir o status do KR como "Em dia" com a cor verde associada.

*   **Cenário 2: KR Em risco**
    *   **Dado** que um KR tem um `Valor Planejado` de 100 pacientes para o período atual
    *   **Quando** o Líder de Franquia atualiza o `Valor Realizado` para 90
    *   **Então** o sistema deve exibir o status do KR como "Em risco" com a cor amarela associada.

*   **Cenário 3: KR Atrasado**
    *   **Dado** que um KR tem um `Valor Planejado` de 100 pacientes para o período atual
    *   **Quando** o Líder de Franquia atualiza o `Valor Realizado` para 84
    *   **Então** o sistema deve exibir o status do KR como "Atrasado" com a cor vermelha associada.

*   **Cenário 4: KR decrescente Em dia**
    *   **Dado** que um KR tem como objetivo reduzir a taxa de erro de 10% para um `Valor Planejado` de 8%
    *   **Quando** o `Valor Realizado` da taxa de erro é atualizado para 7.5%
    *   **Então** o sistema deve exibir o status do KR como "Em dia" com a cor verde associada.

*   **Cenário 5: KR Não Iniciado**
    *   **Dado** que um novo KR foi criado com um `Valor Planejado` de 50, mas seu `Valor Realizado` ainda é nulo ou zero
    *   **Quando** um usuário visualiza este KR
    *   **Então** o sistema deve exibir o status como "Não Iniciado".

## Casos Limite
*   **Valor Planejado é Zero:** Se o `Valor Planejado` para um período for 0, e o `Valor Realizado` for maior que 0, o status deve ser "Em dia". Se ambos forem 0, o status deve ser "Não Iniciado".
*   **Planejamento Ausente:** Se um KR não tiver um `Valor Planejado` definido para o período de acompanhamento atual, o status não pode ser calculado. O sistema deve exibir uma mensagem clara como "Pendente de Planejamento".
*   **Progresso Negativo:** O sistema não deve aceitar um `Valor Realizado` negativo para KRs de crescimento. Uma validação deve impedir a entrada deste tipo de dado.

## Fluxos Alternativos
*   **Anulação Manual do Status:**
    *   **Contexto:** Um Líder de Franquia pode ter informações qualitativas que justificam um status diferente do calculado pelo sistema (ex: um grande contrato está para ser fechado, o que reverterá o atraso).
    *   **Fluxo:** O sistema deve permitir que um usuário com a devida permissão (ex: Líder de Franquia) possa alterar manualmente o status de um KR.
    *   **Regras:**
        1.  Ao anular o status, o sistema deve obrigar o usuário a inserir uma justificativa em texto.
        2.  Um KR com status manual deve ser claramente sinalizado na interface para indicar que não reflete o cálculo automático.
        3.  O status manual permanece até que o usuário decida revertê-lo para o cálculo automático. Ele não é alterado por novas atualizações de progresso.