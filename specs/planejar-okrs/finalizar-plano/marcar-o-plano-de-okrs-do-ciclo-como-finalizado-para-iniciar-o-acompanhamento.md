Com certeza! Baseado na história de usuário e no rico contexto fornecido, aqui está a especificação de desenvolvimento completa.

---

# Finalizar Plano de OKRs do Ciclo

## Descricao
Como um Líder de Franquia, eu quero marcar o plano de OKRs do meu ciclo como "Finalizado". Esta ação representa a transição oficial da fase de planejamento para a fase de acompanhamento, "travando" a estrutura de Objetivos e Key Results para garantir a integridade dos dados durante o ciclo e habilitando a funcionalidade de registro de progresso.

## Regras de Negocio
1.  **Imutabilidade do Plano:** Uma vez que um plano é marcado como "Finalizado", a sua estrutura principal torna-se imutável para o restante do ciclo. Isso inclui:
    *   Não é possível adicionar, editar ou remover Objetivos.
    *   Não é possível adicionar, editar ou remover Key Results.
    *   Não é possível alterar os valores-alvo (target) ou o progresso planejado (phasing) dos Key Results.
    *   Comentários e atualizações de progresso (valor atual) continuam sendo permitidos, pois fazem parte do acompanhamento.
2.  **Transição de Status:** O plano de OKRs deve possuir um status que reflita sua fase no ciclo. A ação de finalizar transiciona o status de "Em Planejamento" (ou similar) para "Finalizado" (ou "Ativo").
3.  **Condição de Finalização:** Um plano só pode ser finalizado se atender aos critérios mínimos de validade:
    *   Deve conter pelo menos um Objetivo.
    *   Cada Objetivo no plano deve conter pelo menos um Key Result associado.
    *   Cada Key Result deve ter seu valor inicial, valor-alvo e progresso planejado (phasing) completamente definidos.
4.  **Habilitação de Acompanhamento:** A finalização do plano é o gatilho que habilita a funcionalidade de registrar o progresso (valor atual) nos Key Results. Antes da finalização, essa funcionalidade deve estar desabilitada.
5.  **Autorização:** Apenas o usuário com o papel de "Líder de Franquia" (ou um administrador do sistema) pode finalizar o plano de sua respectiva franquia.
6.  **Ação Irreversível (dentro do fluxo padrão):** A finalização de um plano é uma ação definitiva para o ciclo. A reabertura de um plano finalizado deve ser tratada como um fluxo de exceção, não como uma funcionalidade padrão.

## Criterios de Aceitacao
*   **Dado** um Líder de Franquia com um plano de OKRs no status "Em Planejamento" que atende a todos os critérios de validade,
    **Quando** ele seleciona a opção para "Finalizar Plano" e confirma a ação,
    **Então** o status do plano deve ser alterado para "Finalizado",
    **E** as opções para editar, adicionar ou remover Objetivos e Key Results devem ser desabilitadas.

*   **Dado** um plano de OKRs com o status "Finalizado",
    **Quando** um usuário (Líder de Franquia ou Membro da Equipe) acessa um Key Result,
    **Então** o sistema deve permitir que ele insira ou atualize o valor de progresso atual.

*   **Dado** um plano de OKRs com o status "Finalizado",
    **Quando** o Líder de Franquia tenta adicionar um novo Objetivo,
    **Então** o sistema deve impedi-lo e exibir uma mensagem informativa de que o plano já foi finalizado.

*   **Dado** um plano de OKRs com o status "Em Planejamento",
    **Quando** um usuário tenta registrar progresso em um Key Result,
    **Então** o sistema deve impedir a ação, pois o plano ainda não foi finalizado.

## Casos Limite
*   **Finalizar Plano Vazio:** Se o Líder de Franquia tentar finalizar um plano que não contém nenhum Objetivo, o sistema deve bloquear a ação e exibir uma mensagem de erro clara, como "Não é possível finalizar um plano sem Objetivos definidos."
*   **Finalizar com Key Results Incompletos:** Se o Líder de Franquia tentar finalizar um plano onde um ou mais Key Results não possuem valor-alvo ou progresso planejado (phasing) definido, o sistema deve bloquear a ação e indicar quais Key Results precisam ser completados.
*   **Finalizar com Objetivos sem Key Results:** Se um plano contiver um Objetivo sem nenhum Key Result associado, o sistema deve impedir a finalização e informar ao usuário que todos os Objetivos precisam ter ao menos um Key Result.

## Fluxos Alternativos
*   **Cancelamento da Ação:**
    *   **Dado** que o Líder de Franquia iniciou a ação de finalizar o plano,
    *   **Quando** o sistema exibe uma caixa de diálogo de confirmação (ex: "Tem certeza que deseja finalizar o plano? Esta ação não poderá ser desfeita.") e o usuário seleciona "Cancelar",
    *   **Então** o processo deve ser interrompido e o status do plano deve permanecer como "Em Planejamento".

*   **Falha por Validação:**
    *   **Dado** que o Líder de Franquia tenta finalizar um plano que não atende a uma das regras de negócio (ex: KR incompleto),
    *   **Quando** ele clica em "Finalizar Plano",
    *   **Então** o sistema não altera o status do plano e exibe uma notificação específica e amigável explicando o motivo da falha e o que precisa ser corrigido para prosseguir.