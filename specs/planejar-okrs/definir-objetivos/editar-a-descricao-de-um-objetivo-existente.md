Com certeza! Aqui está a especificação de desenvolvimento para a história de usuário "Editar a descrição de um Objetivo existente", criada com base no contexto fornecido e seguindo o formato solicitado.

---

# Editar a descrição de um Objetivo existente

## Descricao
Como um **Líder de Franquia**, quero poder editar a descrição de um Objetivo que já foi criado, para que eu possa refinar sua definição, corrigir erros ou ajustar o texto para melhorar a clareza para minha equipe e para a liderança sênior.

## Regras de Negocio
1.  Apenas usuários com a permissão de **Líder de Franquia** podem editar os Objetivos associados à sua própria franquia.
2.  Um Objetivo só pode ser editado se pertencer a um ciclo de planejamento que está **ativo** ou **em rascunho**. Objetivos de ciclos já finalizados/fechados são somente leitura e não podem ser alterados para preservar o histórico.
3.  A descrição de um Objetivo é obrigatória e não pode ser salva como vazia.
4.  A descrição possui um limite máximo de 500 caracteres para garantir concisão e boa visualização nos relatórios.
5.  A alteração da descrição deve ser visível imediatamente para todos os usuários que têm acesso ao Objetivo (Membros da Equipe, Líderes Sêniores, etc.).
6.  Salvar a edição da descrição não altera nenhum outro atributo do Objetivo ou de seus Key Results associados.

## Criterios de Aceitacao
**Cenário 1: Edição bem-sucedida da descrição**
*   **Dado** que eu sou um Líder de Franquia logado no sistema
*   **E** estou visualizando um Objetivo que pertence a um ciclo de planejamento ativo
*   **Quando** eu clico na opção para editar a descrição do Objetivo
*   **E** altero o texto existente para um novo conteúdo válido
*   **E** confirmo a alteração (ex: clicando em "Salvar")
*   **Então** o sistema deve exibir uma mensagem de sucesso
*   **E** a nova descrição do Objetivo deve ser exibida na tela, substituindo a anterior.

**Cenário 2: Cancelar a edição da descrição**
*   **Dado** que eu sou um Líder de Franquia logado no sistema
*   **E** estou no modo de edição da descrição de um Objetivo
*   **E** eu já fiz alterações no texto
*   **Quando** eu clico na opção para cancelar a edição (ex: botão "Cancelar" ou fechando o formulário)
*   **Então** as alterações que eu fiz devem ser descartadas
*   **E** a descrição original do Objetivo deve continuar sendo exibida, sem nenhuma modificação.

## Casos Limite
*   **Tentativa de salvar uma descrição vazia:**
    *   **Dado** que estou editando a descrição de um Objetivo
    *   **Quando** eu apago todo o texto e tento salvar
    *   **Então** o sistema deve exibir uma mensagem de erro informando que o campo é obrigatório e não deve permitir o salvamento, mantendo o modo de edição ativo.

*   **Tentativa de salvar uma descrição excedendo o limite de caracteres:**
    *   **Dado** que estou editando a descrição de um Objetivo
    *   **Quando** eu insiro um texto com mais de 500 caracteres e tento salvar
    *   **Então** o sistema deve exibir uma mensagem de erro informando sobre o limite de caracteres e não deve permitir o salvamento.

*   **Perda de conexão durante o salvamento:**
    *   **Dado** que estou editando a descrição de um Objetivo e confirmo o salvamento
    *   **Quando** ocorre uma falha de conexão com o servidor
    *   **Então** o sistema deve exibir uma mensagem informando que a alteração não pôde ser salva e as alterações devem ser preservadas no campo de edição para que eu possa tentar novamente.

## Fluxos Alternativos
*   **Tentativa de editar um Objetivo de um ciclo finalizado:**
    *   **Dado** que eu sou um Líder de Franquia
    *   **E** estou visualizando um Objetivo que pertence a um ciclo de planejamento já finalizado
    *   **Então** a opção para editar a descrição (ex: botão, ícone de lápis) não deve estar visível ou deve estar desabilitada.
    *   **E** se eu tentar acessar a funcionalidade de edição por outros meios (ex: URL direta), o sistema deve me redirecionar ou exibir uma mensagem informando que o Objetivo não pode ser modificado.