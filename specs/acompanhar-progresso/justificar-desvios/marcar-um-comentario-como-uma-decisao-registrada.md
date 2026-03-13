Com certeza! Baseado na história de usuário e no rico contexto de produto fornecido, aqui está a especificação de desenvolvimento detalhada.

---

# Registrar Decisão em Comentário de Key Result

## Descrição
Como um **Líder de Franquia**, eu quero poder marcar um comentário específico em um Key Result (KR) como uma "Decisão Registrada". O objetivo é formalizar e dar visibilidade a uma justificativa ou a um plano de ação acordado para um desvio de performance, criando um registro histórico claro que pode ser facilmente consultado pela liderança sênior durante as reuniões de estratégia.

## Regras de Negócio
1.  **Origem da Decisão**: A funcionalidade de "Decisão Registrada" só pode ser aplicada a um comentário já existente em um Key Result. Não é possível criar uma "Decisão" sem um comentário associado.
2.  **Permissões**: Apenas usuários com permissão para editar o Key Result (ex: Líder de Franquia) podem marcar ou desmarcar um comentário como "Decisão Registrada". Outros usuários (ex: Líder Sênior, Membro da Equipe) podem apenas visualizar.
3.  **Destaque Visual**: Um comentário marcado como "Decisão Registrada" deve ser visualmente distinto dos demais comentários. Isso pode incluir um ícone específico, uma borda colorida, um selo/etiqueta ou um fundo destacado.
4.  **Imutabilidade do Conteúdo**: Uma vez que um comentário é marcado como "Decisão Registrada", seu texto não pode ser editado. Para alterar o texto, o usuário deve primeiro desmarcar a decisão.
5.  **Múltiplas Decisões**: Um mesmo Key Result pode ter múltiplos comentários marcados como "Decisão Registrada" ao longo do tempo, representando diferentes decisões tomadas em diferentes momentos.
6.  **Unicidade por Comentário**: Um mesmo comentário não pode ser marcado como "Decisão Registrada" mais de uma vez. A ação é binária (marcado ou não marcado).
7.  **Registro de Auditoria**: O sistema deve registrar qual usuário marcou o comentário como decisão e a data/hora em que a ação ocorreu. Essa informação deve ser visível junto ao comentário.

## Criterios de Aceitacao
**Cenário 1: Marcar um comentário como Decisão Registrada**
*   **Dado** que eu sou um Líder de Franquia visualizando um Key Result com uma lista de comentários.
*   **Quando** eu seleciono a opção "Marcar como Decisão Registrada" em um comentário específico.
*   **Então** o sistema deve:
    *   Aplicar um destaque visual claro ao comentário.
    *   Exibir a informação de "Decisão registrada por [Meu Nome] em [Data/Hora]".
    *   Tornar o texto do comentário não editável.
    *   Manter a opção para "Desmarcar como Decisão".

**Cenário 2: Desmarcar uma Decisão Registrada**
*   **Dado** que eu sou um Líder de Franquia visualizando um comentário que já está marcado como "Decisão Registrada".
*   **Quando** eu seleciono a opção "Desmarcar como Decisão".
*   **Então** o sistema deve:
    *   Remover todo o destaque visual associado à decisão.
    *   Remover a informação de "Decisão registrada por...".
    *   Tornar o texto do comentário editável novamente.

**Cenário 3: Visualização por um usuário sem permissão de edição**
*   **Dado** que um Líder de Franquia marcou um comentário como "Decisão Registrada" em um KR.
*   **Quando** um Líder Sênior (ou qualquer usuário com permissão de apenas leitura) visualiza o mesmo KR.
*   **Então** ele deve ver o comentário com todo o seu destaque visual e informações de auditoria, mas não deve ter acesso às opções para marcar ou desmarcar a decisão.

## Casos Limite
1.  **Tentativa de Exclusão**:
    *   Um comentário que está atualmente marcado como "Decisão Registrada" não pode ser excluído.
    *   O sistema deve exibir uma mensagem informativa ao usuário, como: "Não é possível excluir este comentário, pois ele está marcado como uma Decisão Registrada. Desmarque a decisão primeiro para poder excluí-lo."
2.  **Usuário Sem Permissão**:
    *   Se um usuário sem permissão de edição tentar, por qualquer meio, acionar a função de marcar/desmarcar, a ação deve ser bloqueada. A interface idealmente não deveria nem exibir os controles para este usuário.
3.  **Comentário do Key Result é Excluído**:
    *   Se o próprio Key Result for excluído, todos os comentários e decisões registradas associados a ele também devem ser removidos, seguindo a lógica de exclusão em cascata.

## Fluxos Alternativos
1.  **Correção de uma Decisão Registrada**:
    *   **Contexto**: O Líder de Franquia marcou um comentário, mas percebeu que o texto da decisão precisava de um ajuste.
    *   **Fluxo**:
        1. O usuário seleciona "Desmarcar como Decisão" no comentário em questão.
        2. O comentário volta ao seu estado normal e editável.
        3. O usuário edita o texto do comentário para fazer a correção.
        4. O usuário seleciona "Marcar como Decisão Registrada" novamente no mesmo comentário, agora com o texto atualizado.
2.  **Marcação do Comentário Errado**:
    *   **Contexto**: O Líder de Franquia acidentalmente marcou o comentário errado como uma decisão.
    *   **Fluxo**:
        1. O usuário seleciona "Desmarcar como Decisão" no comentário incorreto.
        2. O comentário incorreto volta ao seu estado normal.
        3. O usuário localiza o comentário correto na lista.
        4. O usuário seleciona "Marcar como Decisão Registrada" no comentário correto.