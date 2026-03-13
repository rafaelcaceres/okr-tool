Claro, aqui está a especificação completa para a história de usuário, seguindo o formato solicitado e utilizando o contexto fornecido.

---

# Vincular Key Result a uma Iniciativa Externa

## Descrição
Para aumentar a rastreabilidade entre a estratégia (OKRs) e a execução (iniciativas), o **Líder de Franquia** precisa poder associar um Key Result (KR) a um link externo. Este link apontará para a ferramenta onde a iniciativa correspondente é gerenciada (como um Epic no Jira, um projeto no Asana, um quadro no Trello, etc.), fornecendo contexto adicional para quem consulta o KR e estabelecendo a base para futuras integrações.

## Regras de Negócio
1.  Um Key Result pode estar vinculado a, no máximo, uma iniciativa externa.
2.  A vinculação de uma iniciativa é opcional. Um KR pode existir sem um link externo associado.
3.  O link da iniciativa externa deve ser uma URL válida (iniciando com `http://` ou `https://`). O sistema não valida o conteúdo ou a acessibilidade do link, apenas seu formato.
4.  Apenas usuários com permissão para criar ou editar um Key Result podem adicionar, alterar ou remover o link da iniciativa externa.
5.  Qualquer usuário com permissão para visualizar o Key Result poderá ver e clicar no link da iniciativa associada.
6.  Ao clicar no link, o destino deve ser aberto em uma nova aba do navegador para não interromper o fluxo do usuário na plataforma de OKRs.

## Critérios de Aceitação

### Cenário 1: Adicionar um link a um novo KR
*   **Dado** que eu sou um Líder de Franquia criando um novo Key Result
*   **Quando** eu preencho os detalhes do KR e insiro uma URL válida no campo "Iniciativa Externa"
*   **Então** o KR deve ser salvo com o link associado, e ao visualizá-lo, o link deve ser exibido como um hiperlink clicável.

### Cenário 2: Adicionar um link a um KR existente
*   **Dado** que eu sou um Líder de Franquia editando um Key Result que não possui um link de iniciativa
*   **Quando** eu adiciono uma URL válida no campo "Iniciativa Externa" e salvo as alterações
*   **Então** o KR deve ser atualizado e o novo link deve ser exibido em seus detalhes.

### Cenário 3: Alterar um link existente
*   **Dado** que eu sou um Líder de Franquia editando um Key Result que já possui um link de iniciativa
*   **Quando** eu substituo a URL existente por uma nova URL válida e salvo as alterações
*   **Então** o KR deve ser atualizado e o novo link deve ser exibido, substituindo o anterior.

### Cenário 4: Remover um link de iniciativa
*   **Dado** que eu sou um Líder de Franquia editando um Key Result que possui um link de iniciativa
*   **Quando** eu apago o conteúdo do campo "Iniciativa Externa" e salvo as alterações
*   **Então** o KR deve ser atualizado e o link da iniciativa não deve mais ser exibido.

### Cenário 5: Visualizar um KR com link de iniciativa
*   **Dado** que um Key Result possui um link de iniciativa externa associado
*   **Quando** um usuário (Líder de Franquia, Líder Sênior ou Membro da Equipe) visualiza os detalhes deste KR
*   **Então** ele deve ver o link claramente identificado e, ao clicar nele, o endereço deve ser aberto em uma nova aba do navegador.

## Casos Limite

### Cenário 1: Tentativa de salvar com formato de URL inválido
*   **Dado** que estou editando um Key Result
*   **Quando** eu insiro um texto que não é uma URL válida (ex: "JIRA-123", "meu-projeto", "www.site.com") no campo "Iniciativa Externa" e tento salvar
*   **Então** o sistema deve exibir uma mensagem de erro clara, como "Por favor, insira uma URL válida (ex: https://jira.empresa.com/browse/PROJ-123)", e não deve permitir que o KR seja salvo até que o erro seja corrigido.

### Cenário 2: URL excessivamente longa
*   **Dado** que estou editando um Key Result
*   **Quando** eu insiro uma URL que excede o limite máximo de caracteres definido para o campo (ex: 2048 caracteres)
*   **Então** o sistema deve me impedir de inserir mais caracteres ou exibir uma mensagem de erro ao tentar salvar, informando sobre o limite excedido.

## Fluxos Alternativos

### Cenário 1: Cancelar a adição/edição do link
*   **Dado** que estou editando um Key Result e adicionei ou modifiquei o link da iniciativa
*   **Quando** eu clico em "Cancelar" ou fecho a tela de edição sem salvar
*   **Então** as alterações no link não devem ser persistidas e o KR deve manter seu estado original (com o link antigo ou sem link algum).

### Cenário 2: Usuário sem permissão de edição
*   **Dado** que um usuário sem permissão para editar KRs (ex: Membro da Equipe com acesso somente leitura) está visualizando um KR
*   **Quando** ele inspeciona os detalhes do KR
*   **Então** ele pode ver e clicar no link da iniciativa, se existir, mas não deve ver a opção (campo, botão, ícone) para adicionar, editar ou remover o link.