Com certeza. Aqui está a especificação de desenvolvimento para a história de usuário fornecida, focada nas regras de negócio e utilizando o contexto do produto.

---

# Atualizar Manualmente o Progresso de um Key Result

## Descrição
Como um **Líder de Franquia**, eu quero poder lançar manualmente o valor atual de um Key Result (KR) numérico ou marcar o progresso de um KR de marcos (milestones). Isso me permite manter os dados de performance do meu time atualizados, garantindo que o sistema calcule e exiba o status (saúde) correto do KR, o que é essencial para reportar o progresso à liderança sênior.

## Regras de Negócio
1.  **Autorização**: Apenas usuários com permissão para editar um OKR (tipicamente o Líder de Franquia responsável ou membros designados da equipe) podem lançar o progresso de seus Key Results.
2.  **Recálculo Automático**: Após a inserção de um novo valor atual, o sistema deve recalcular automaticamente o percentual de progresso do KR e atualizar seu status de saúde (ex: verde, amarelo, vermelho) com base na comparação entre o valor realizado e o valor planejado ("phasing") para o período corrente.
3.  **Tipos de Medida**: O sistema deve suportar a atualização para diferentes tipos de Key Results:
    *   **Numérico (Crescente/Decrescente)**: O usuário deve inserir um valor numérico (ex: número de pacientes, receita, bugs corrigidos).
    *   **Percentual**: O usuário deve inserir um valor entre 0 e 100.
    *   **Marcos (Milestones)**: O usuário não insere um valor, mas marca um ou mais marcos predefinidos como "concluídos". O progresso é calculado como a proporção de marcos concluídos sobre o total (ex: 2 de 4 marcos concluídos = 50% de progresso).
4.  **Validação de Entrada**: O valor inserido deve ser validado de acordo com o tipo do KR.
    *   Para KRs numéricos e percentuais, a entrada deve ser um número. Texto ou caracteres especiais não são permitidos.
    *   Não devem ser permitidos valores negativos, a menos que o KR tenha sido configurado para tal (ex: redução de custos).
5.  **Período de Atualização**: Lançamentos de progresso só podem ser feitos para o período de acompanhamento atual (ex: mês ou trimestre corrente). Períodos passados e já consolidados devem ser bloqueados para edição.
6.  **Precedência da Atualização**: Uma atualização manual sempre sobrescreve o valor anterior do KR, independentemente de a fonte anterior ter sido manual ou uma futura integração automática (ex: Jira).
7.  **Rastreabilidade (Audit Trail)**: Cada atualização manual deve ser registrada, guardando a informação de qual usuário realizou a alteração, o novo valor e a data/hora da atualização.

## Critérios de Aceitação
*   **Cenário 1: Atualizar KR Numérico com Sucesso**
    *   **Dado** que eu sou um Líder de Franquia e estou visualizando um KR do tipo numérico com meta de "100" e valor atual de "40".
    *   **Quando** eu edito o KR e insiro o novo valor atual "55".
    *   **Então** o sistema deve salvar o valor "55", o progresso visual (ex: barra de progresso) deve ser atualizado para 55%, e o status de saúde (farol) deve ser recalculado automaticamente com base no planejado para o período.

*   **Cenário 2: Atualizar KR de Marcos (Milestones)**
    *   **Dado** que eu sou um Líder de Franquia visualizando um KR com 4 marcos, onde 1 já está concluído (progresso de 25%).
    *   **Quando** eu marco o segundo marco como "concluído".
    *   **Então** o sistema deve registrar a conclusão do marco, o progresso geral do KR deve ser atualizado para "50%", e o status de saúde deve ser recalculado.

*   **Cenário 3: Tentativa de Inserir Dado Inválido**
    *   **Dado** que estou na tela de edição de um KR do tipo numérico.
    *   **Quando** eu tento inserir o texto "cinquenta" no campo de valor atual e tento salvar.
    *   **Então** o sistema deve rejeitar a entrada, exibir uma mensagem de erro clara (ex: "Por favor, insira um valor numérico válido.") e o valor anterior do KR deve ser mantido.

*   **Cenário 4: Verificar Histórico da Atualização**
    *   **Dado** que eu acabei de atualizar o valor de um KR de "40" para "55".
    *   **Quando** eu acesso a área de detalhes ou histórico desse KR.
    *   **Então** eu devo ver um registro indicando que meu usuário alterou o valor para "55" na data e hora da atualização.

## Casos Limite
*   **Primeiro Lançamento**: Se um KR nunca teve seu progresso atualizado (valor nulo ou inicial), o primeiro lançamento deve funcionar corretamente, movendo o progresso de 0% (ou do valor inicial) para o novo percentual.
*   **Atingimento da Meta**: Se o valor inserido for igual ou superior à meta final do KR, o progresso deve ser exibido como 100% (ou mais, se aplicável) e o status deve ser refletido como "concluído" ou "verde".
*   **Redução do Valor**: O sistema deve permitir que um usuário insira um valor menor que o anterior (ex: correção de um lançamento errado). O progresso e o status devem ser recalculados para baixo adequadamente.

## Fluxos Alternativos
*   **Fluxo 1: Cancelar a Atualização**
    *   **Dado** que eu abri a interface para editar o valor de um KR.
    *   **Quando** eu clico no botão "Cancelar" ou fecho a janela sem salvar.
    *   **Então** nenhuma alteração deve ser gravada e o valor original do KR deve ser mantido na visualização.

*   **Fluxo 2: Tentativa de Atualização Sem Permissão**
    *   **Dado** que eu sou um usuário que não tem permissão para editar os OKRs de uma determinada franquia.
    *   **Quando** eu visualizo um KR dessa franquia.
    *   **Então** o campo de valor atual deve estar em modo de apenas leitura, e os botões ou opções para editar/salvar o progresso não devem estar visíveis ou devem estar desabilitados.