Com certeza! Aqui está a especificação de desenvolvimento para a história "Excluir um Key Result", criada com base no contexto fornecido e focada nas regras de negócio.

---

# Excluir um Key Result

## Descricao
Como um **Líder de Franquia**, eu quero poder excluir um Key Result que foi adicionado por engano ou que não é mais relevante para o objetivo, para manter o plano de OKRs limpo, focado e preciso.

## Regras de Negocio
1.  **Permissão de Exclusão**: Apenas usuários com papel de "Líder de Franquia" ou superior podem excluir um Key Result.
2.  **Proteção de Histórico**: Um Key Result **não pode** ser excluído se já tiver qualquer progresso reportado (seja manual ou automático). A integridade dos dados históricos é prioritária.
3.  **Confirmação Obrigatória**: A exclusão é uma ação destrutiva e irreversível. O sistema deve sempre solicitar uma confirmação explícita do usuário antes de efetivar a exclusão.
4.  **Recálculo do Objetivo**: Após a exclusão de um Key Result, o cálculo de progresso geral do Objetivo ao qual ele pertencia deve ser automaticamente refeito, desconsiderando os valores do item removido.
5.  **Desvinculação de Iniciativas**: Se o Key Result a ser excluído estiver vinculado a iniciativas externas (ex: Jira), esses vínculos devem ser removidos como parte da exclusão, sem afetar o sistema externo.
6.  **Auditoria**: Toda ação de exclusão de um Key Result deve ser registrada em um log de atividades para fins de auditoria, registrando qual usuário realizou a ação e quando.

## Criterios de Aceitacao
-   **Cenário 1: Exclusão de um Key Result sem progresso (Caminho Feliz)**
    -   **Dado** que eu sou um Líder de Franquia e estou visualizando um Objetivo.
    -   **E** existe um Key Result associado a este Objetivo que ainda não possui nenhum progresso reportado.
    -   **Quando** eu aciono a opção de "Excluir" para este Key Result e confirmo a ação na caixa de diálogo.
    -   **Então** o Key Result deve ser removido permanentemente da lista.
    -   **E** o progresso geral do Objetivo deve ser recalculado.

-   **Cenário 2: Tentativa de exclusão de um Key Result com progresso reportado**
    -   **Dado** que eu sou um Líder de Franquia e estou visualizando um Objetivo.
    -   **E** existe um Key Result que já possui progresso reportado em um período anterior.
    -   **Quando** eu tento acionar a opção de "Excluir" para este Key Result.
    -   **Então** a ação deve ser bloqueada.
    -   **E** uma mensagem informativa deve ser exibida, explicando que Key Results com histórico de progresso não podem ser excluídos (sugerindo, se aplicável, a inativação).

-   **Cenário 3: Cancelamento da ação de exclusão**
    -   **Dado** que eu sou um Líder de Franquia e estou prestes a excluir um Key Result sem progresso.
    -   **Quando** a caixa de diálogo de confirmação é exibida e eu seleciono a opção "Cancelar" (ou fecho a caixa de diálogo).
    -   **Então** a exclusão não deve ocorrer e o Key Result deve permanecer na lista, inalterado.

-   **Cenário 4: Usuário sem permissão tenta excluir**
    -   **Dado** que eu sou um usuário com papel de "Membro da Equipe".
    -   **Quando** eu acesso a tela de detalhamento de um Objetivo.
    -   **Então** a opção (botão, ícone ou link) para excluir um Key Result não deve estar visível para mim.

## Casos Limite
-   **Exclusão do Último Key Result de um Objetivo**: Se o usuário excluir o último Key Result de um Objetivo, o Objetivo deve permanecer, mas agora sem nenhum Key Result associado. O progresso do Objetivo se torna indefinido ou 0%, a depender da regra de negócio para Objetivos sem KRs.
-   **Concorrência**: Se dois usuários tentarem modificar o mesmo Objetivo simultaneamente (um excluindo um KR enquanto outro edita um diferente), o sistema deve garantir a consistência dos dados, processando uma ação de cada vez ou notificando um dos usuários sobre o conflito.
-   **Key Result com Comentários mas Sem Progresso**: Se um Key Result possui comentários ou justificativas, mas o valor do progresso ainda é zero (ou o valor inicial), ele deve poder ser excluído, pois não há histórico de performance a ser preservado.

## Fluxos Alternativos
-   **Inativar em vez de Excluir**:
    -   **Contexto**: O usuário tenta excluir um Key Result que possui histórico de progresso e a ação é bloqueada conforme a regra de negócio.
    -   **Fluxo**: O sistema, além de exibir a mensagem de erro, oferece uma ação alternativa como "Inativar" ou "Arquivar". Um Key Result inativo não conta mais para o cálculo de progresso do Objetivo, mas permanece visível (talvez em uma seção separada ou com um indicador visual) para consulta de seu histórico.