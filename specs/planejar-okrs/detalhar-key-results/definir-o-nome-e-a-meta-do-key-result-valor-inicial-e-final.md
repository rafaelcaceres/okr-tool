Com certeza! Baseado na história de usuário e no rico contexto fornecido, aqui está a especificação de desenvolvimento completa, seguindo o formato solicitado.

---

# Definir Detalhes de um Key Result (Nome e Meta)

## Descricao
Como um **Líder de Franquia**, desejo poder definir os elementos fundamentais de um novo Key Result (KR) dentro de um Objetivo, especificando seu nome, valor inicial e valor final (meta). Isso me permitirá estabelecer uma base clara e mensurável para o acompanhamento do progresso ao longo do ciclo de planejamento.

## Regras de Negocio
1.  **Nome do KR**: É um campo de texto obrigatório e não pode ser vazio.
2.  **Unicidade do Nome**: O nome de um Key Result deve ser único dentro do mesmo Objetivo ao qual pertence.
3.  **Associação Obrigatória**: Todo Key Result deve estar associado a um único Objetivo. Um KR não pode existir de forma isolada.
4.  **Valores Numéricos**: O `valor inicial` e o `valor final` (meta) devem ser campos numéricos, aceitando números inteiros ou decimais.
5.  **Suporte a Valores Negativos**: Os valores inicial e final podem ser negativos (ex: meta de sair de um prejuízo de -R$10.000 para um lucro de R$50.000).
6.  **Direção da Meta**: O sistema deve suportar metas crescentes (onde o valor final é maior que o inicial, ex: aumentar receita) e metas decrescentes (onde o valor final é menor que o inicial, ex: reduzir o número de bugs).
7.  **Meta Nula Inválida**: O `valor inicial` e o `valor final` não podem ser idênticos, pois isso representaria uma meta sem progresso possível.
8.  **Valor Inicial Padrão**: Se um `valor inicial` não for explicitamente fornecido pelo usuário, o sistema deve assumir o valor padrão de `0`.
9.  **Estado Inicial**: Um Key Result recém-criado deve ter seu progresso calculado como 0% e seu status inicial como "Não iniciado".

## Criterios de Aceitacao
-   **Cenário 1: Criar um Key Result com meta crescente**
    -   **Dado** que eu, um Líder de Franquia, estou na tela de planejamento de um Objetivo.
    -   **Quando** eu adiciono um novo Key Result com o nome "Aumentar número de pacientes impactados", valor inicial "5000" e valor final "7500".
    -   **Então** o sistema deve salvar o novo Key Result associado a este Objetivo, com os valores definidos e o progresso inicial em 0%.

-   **Cenário 2: Criar um Key Result com meta decrescente**
    -   **Dado** que eu estou na tela de planejamento de um Objetivo.
    -   **Quando** eu adiciono um novo Key Result com o nome "Reduzir tempo médio de atendimento", valor inicial "45" (minutos) e valor final "30" (minutos).
    -   **Então** o sistema deve salvar o novo Key Result, reconhecendo que o progresso será medido pela redução do valor em direção à meta.

-   **Cenário 3: Criar um Key Result usando o valor inicial padrão**
    -   **Dado** que eu estou na tela de planejamento de um Objetivo.
    -   **Quando** eu adiciono um novo Key Result com o nome "Publicar 5 novos estudos de caso", não preencho o valor inicial e defino o valor final como "5".
    -   **Então** o sistema deve salvar o Key Result com o valor inicial definido como "0" e o valor final como "5".

-   **Cenário 4: Criar um Key Result com valor inicial negativo**
    -   **Dado** que eu estou na tela de planejamento de um Objetivo financeiro.
    -   **Quando** eu adiciono um novo KR com o nome "Aumentar EBTIDA da franquia", valor inicial "-15000" e valor final "50000".
    -   **Então** o sistema deve salvar o novo Key Result com os valores negativo e positivo corretamente.

## Casos Limite
-   **Tentativa de salvar com nome vazio**: O sistema deve exibir uma mensagem de erro clara, indicando que o campo "Nome" é obrigatório, e não deve permitir o salvamento.
-   **Tentativa de salvar com nome duplicado**: Se o usuário tentar criar um KR com um nome que já existe no mesmo Objetivo, o sistema deve exibir uma mensagem de erro informando sobre a duplicidade e impedir o salvamento.
-   **Tentativa de salvar com valores não numéricos**: Se o usuário inserir texto (ex: "mil") nos campos de valor inicial ou final, o sistema deve exibir uma validação em tempo real ou ao salvar, informando que apenas números são permitidos.
-   **Tentativa de salvar com valor inicial igual ao final**: O sistema deve impedir o salvamento e exibir uma mensagem de erro, como "O valor inicial e a meta não podem ser iguais".
-   **Valores muito grandes**: O sistema deve ser capaz de lidar com valores numéricos grandes (ex: milhões ou bilhões) sem quebras ou perda de precisão, conforme os limites de negócio da Sanofi.

## Fluxos Alternativos
-   **Fluxo 1: Cancelamento da criação**
    1.  O Líder de Franquia inicia o processo de adição de um novo Key Result.
    2.  O formulário para preenchimento de nome, valor inicial e final é exibido.
    3.  O usuário preenche alguns dados, mas decide não continuar.
    4.  O usuário clica no botão "Cancelar" ou fecha a interface de criação (ex: modal).
    5.  O sistema descarta todas as informações inseridas e nenhum Key Result é criado. A tela retorna ao estado anterior.

-   **Fluxo 2: Erro de validação ao salvar**
    1.  O Líder de Franquia preenche o formulário de criação do KR com dados inválidos (ex: nome em branco e valor final igual ao inicial).
    2.  O usuário clica no botão "Salvar".
    3.  O sistema impede a criação do KR.
    4.  O sistema exibe mensagens de erro claras e específicas próximas a cada campo inválido.
    5.  Os dados que foram preenchidos corretamente permanecem no formulário para que o usuário possa apenas corrigir os erros sem precisar redigitar tudo.