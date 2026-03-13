Claro, aqui está a especificação de desenvolvimento completa para a história, seguindo o formato solicitado e utilizando o rico contexto fornecido.

---

# Adicionar Comentário para Justificar Progresso de Key Result

## Descrição
Como um **Líder de Franquia**, eu quero poder adicionar um comentário de texto a um Key Result específico, para poder justificar o status atual (ex: verde, amarelo, vermelho), explicar um desvio em relação ao progresso planejado ("phasing"), ou fornecer contexto adicional para a liderança durante as reuniões de estratégia.

## Regras de Negócio
1.  Um comentário está sempre associado a um único Key Result.
2.  Um Key Result pode ter múltiplos comentários, formando um histórico de justificativas e atualizações.
3.  Cada comentário deve registrar automaticamente o autor (nome do usuário) e a data/hora de sua criação.
4.  Apenas usuários com permissão para atualizar o progresso do Key Result podem adicionar, editar ou excluir seus próprios comentários.
5.  Usuários com permissão de visualização do Key Result podem ver todos os comentários, mas não podem adicionar, editar ou excluir nenhum.
6.  Os comentários devem ser exibidos em ordem cronológica inversa (o mais recente no topo).
7.  Um comentário tem um limite máximo de 500 caracteres para incentivar a concisão.
8.  O autor de um comentário pode editá-lo ou excluí-lo.
9.  Ao ser editado, o comentário deve indicar que foi modificado (ex: exibindo um rótulo "editado" e a data da última modificação).

## Critérios de Aceitação

### Cenário 1: Adicionar um novo comentário
*   **Dado** que eu sou um Líder de Franquia visualizando um Key Result
*   **Quando** eu escrevo um texto na área de comentários e confirmo a adição
*   **Então** o novo comentário deve aparecer no topo da lista, associado ao meu nome de usuário e à data e hora atuais.

### Cenário 2: Visualizar comentários existentes
*   **Dado** que um Key Result possui um ou mais comentários
*   **Quando** eu, como Líder de Franquia ou Líder Sênior, acesso a tela de detalhes deste Key Result
*   **Então** eu devo ver a lista de todos os comentários, ordenados do mais recente para o mais antigo.

### Cenário 3: Editar um comentário próprio
*   **Dado** que eu sou o autor de um comentário existente em um Key Result
*   **Quando** eu escolho a opção de editar, modifico o texto e salvo a alteração
*   **Então** o comentário na lista deve ser atualizado com o novo texto e deve exibir uma indicação de que foi editado.

### Cenário 4: Excluir um comentário próprio
*   **Dado** que eu sou o autor de um comentário existente em um Key Result
*   **Quando** eu escolho a opção de excluir e confirmo a ação
*   **Então** o comentário deve ser permanentemente removido da lista de comentários daquele Key Result.

### Cenário 5: Tentativa de ação por usuário sem permissão
*   **Dado** que eu sou um usuário com permissão apenas de visualização
*   **Quando** eu acesso a tela de detalhes de um Key Result com comentários
*   **Então** eu devo ser capaz de ver os comentários, mas não devo ver os botões ou opções para adicionar, editar ou excluir nenhum comentário.

## Casos Limite
1.  **Adicionar comentário vazio:**
    *   O sistema não deve permitir a criação de um comentário sem texto. Ao tentar salvar um comentário vazio, uma mensagem de erro deve ser exibida ao usuário, informando que o campo é obrigatório.
2.  **Exceder o limite de caracteres:**
    *   O sistema deve impedir que o usuário digite ou salve um comentário com mais de 500 caracteres. Uma indicação visual do limite de caracteres (ex: contador `250/500`) deve estar presente, e o salvamento deve ser bloqueado caso o limite seja ultrapassado, com uma mensagem informativa.
3.  **Falha de Conexão:**
    *   Se ocorrer uma falha de rede ao tentar salvar, editar ou excluir um comentário, o sistema deve notificar o usuário que a ação falhou e o estado do comentário não foi alterado. O texto digitado pelo usuário não deve ser perdido, permitindo uma nova tentativa.

## Fluxos Alternativos
1.  **Cancelamento da adição de comentário:**
    *   **Dado** que eu comecei a escrever um novo comentário
    *   **Quando** eu decido cancelar a ação (clicando em "Cancelar" ou fechando a interface de adição)
    *   **Então** o comentário não deve ser salvo e o texto que eu digitei deve ser descartado.

2.  **Tentativa de editar/excluir comentário de outro usuário:**
    *   **Dado** que eu sou um Líder de Franquia visualizando um comentário feito por outra pessoa
    *   **Quando** eu inspeciono o comentário
    *   **Então** as opções para "Editar" e "Excluir" não devem estar visíveis ou devem estar desabilitadas, impedindo a ação.