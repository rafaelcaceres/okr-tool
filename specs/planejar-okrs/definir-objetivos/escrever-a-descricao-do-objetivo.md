Com certeza! Aqui está a especificação de desenvolvimento para a história "Escrever a descrição do Objetivo", criada com base no contexto fornecido e seguindo o formato solicitado.

---

# Definir a Descrição de um Objetivo

## Descrição
Como um **Líder de Franquia**, eu quero poder escrever uma descrição clara e inspiradora para um Objetivo, para que minha equipe entenda a direção estratégica e a liderança sênior compreenda o propósito do nosso foco no período. A descrição é a narrativa qualitativa que responde "O que queremos alcançar e por quê?".

## Regras de Negócio
1.  Todo Objetivo deve obrigatoriamente ter uma descrição. Não é possível criar um Objetivo sem ela.
2.  A descrição de um Objetivo deve ter um limite máximo de 500 caracteres para garantir concisão e clareza nas apresentações.
3.  A descrição pode ser editada a qualquer momento, desde que o ciclo de planejamento de OKRs ao qual o Objetivo pertence não esteja finalizado ou bloqueado (status: `PlanoDeOKRsDaFranquiaFinalizado`).
4.  A descrição deve ser armazenada como texto simples, sem suporte a formatação complexa (negrito, itálico, listas, etc.).
5.  A descrição é única para cada Objetivo individual, mas o mesmo texto pode ser reutilizado em Objetivos de ciclos de planejamento diferentes.

## Critérios de Aceitação
*   **Cenário 1: Criar um novo Objetivo com uma descrição válida**
    *   **Dado** que estou na tela de criação de um novo Objetivo para um ciclo de planejamento aberto.
    *   **Quando** eu preencho o campo "Descrição" com um texto dentro do limite de caracteres e preencho os outros campos obrigatórios.
    *   **Então** o Objetivo é salvo com sucesso e a descrição fornecida é exibida sempre que o Objetivo for visualizado.

*   **Cenário 2: Tentar salvar um Objetivo sem descrição**
    *   **Dado** que estou na tela de criação de um novo Objetivo.
    *   **Quando** eu tento salvar o Objetivo deixando o campo "Descrição" em branco.
    *   **Então** o sistema exibe uma mensagem de erro indicando que a descrição é obrigatória, e o Objetivo não é salvo.

*   **Cenário 3: Tentar salvar uma descrição que excede o limite de caracteres**
    *   **Dado** que estou criando ou editando a descrição de um Objetivo.
    *   **Quando** eu insiro um texto com mais de 500 caracteres e tento salvar.
    *   **Então** o sistema exibe uma mensagem de erro informando sobre o limite de caracteres e não salva o Objetivo.
    *   **E** um contador de caracteres visível (ex: 450/500) deve auxiliar o usuário durante a digitação.

*   **Cenário 4: Editar a descrição de um Objetivo existente**
    *   **Dado** que estou visualizando um Objetivo que pertence a um ciclo de planejamento aberto.
    *   **Quando** eu edito o texto no campo "Descrição" e salvo as alterações.
    *   **Então** a nova descrição substitui a antiga e é refletida em todas as visualizações do Objetivo.

*   **Cenário 5: Tentar editar a descrição de um Objetivo em um plano finalizado**
    *   **Dado** que estou visualizando os detalhes de um Objetivo que pertence a um ciclo de planejamento finalizado.
    *   **Quando** eu tento interagir com o campo "Descrição".
    *   **Então** o campo deve estar em modo de apenas leitura (read-only), impedindo qualquer edição.

## Casos Limite
*   **Descrição contendo apenas espaços em branco:** Se um usuário inserir apenas espaços no campo de descrição e tentar salvar, o sistema deve tratar o campo como vazio e acionar a regra de campo obrigatório.
*   **Colar texto acima do limite:** Se um usuário colar um texto que excede os 500 caracteres, o sistema deve truncar o texto no limite ou, preferencialmente, exibir uma mensagem de erro imediata, não permitindo a ação.
*   **Caracteres especiais e emojis:** A descrição deve suportar corretamente a gravação e exibição de caracteres especiais comuns (acentos, pontuação) e emojis, utilizando um padrão de codificação universal (UTF-8).

## Fluxos Alternativos
*   **Cenário 1: Cancelar a edição da descrição**
    *   **Dado** que estou editando a descrição de um Objetivo existente e já fiz alterações no texto.
    *   **Quando** eu clico no botão "Cancelar" ou saio da tela sem salvar.
    *   **Então** as alterações que eu fiz são descartadas e a descrição retorna ao seu estado original (última versão salva).

*   **Cenário 2: Perda de sessão durante a escrita**
    *   **Dado** que estou escrevendo uma longa descrição para um Objetivo.
    *   **Quando** minha sessão expira ou a conexão é perdida antes de eu salvar.
    *   **Então** (Comportamento ideal) ao retornar à tela, o sistema oferece a opção de restaurar o texto que estava sendo digitado (rascunho salvo automaticamente).
    *   **Então** (Comportamento mínimo) o texto não salvo é perdido, e o campo aparece com a última versão salva (ou em branco, se for um novo Objetivo).