Com certeza! Aqui está a especificação de desenvolvimento para a história "Visualizar ciclos de planejamento existentes", criada com base no contexto fornecido e focada nas regras de negócio.

---

# Visualizar Ciclos de Planejamento Existentes

## Descricao
Como um Líder de Franquia ou Líder Sênior, eu quero visualizar uma lista de todos os ciclos de planejamento (passados, atuais e futuros) para que eu possa facilmente navegar até um período específico e consultar ou gerenciar os OKRs associados a ele.

## Regras de Negocio
1.  **Exibição de Informações:** Para cada ciclo na lista, devem ser exibidos, no mínimo:
    *   Nome do Ciclo (ex: "Q3 2024", "Anual 2024").
    *   Período (Data de Início e Data de Fim).
    *   Status do Ciclo.
2.  **Status do Ciclo:** O status de um ciclo é determinado automaticamente com base na data atual em relação às datas de início e fim do ciclo.
    *   **Futuro:** A data de início do ciclo é posterior à data atual.
    *   **Ativo:** A data atual está entre a data de início e a data de fim do ciclo (inclusive).
    *   **Encerrado:** A data de fim do ciclo é anterior à data atual.
3.  **Ordenação:** A lista de ciclos deve ser exibida em ordem cronológica decrescente, ou seja, do mais recente para o mais antigo, com base na data de início.
4.  **Acesso:** Todos os usuários com permissão para visualizar OKRs (como Líder de Franquia e Líder Sênior) devem ser capazes de ver a lista completa de ciclos de planejamento da organização.
5.  **Navegação:** Cada item na lista de ciclos deve ser navegável, permitindo que o usuário clique nele para acessar a tela de detalhes dos OKRs daquele ciclo específico.

## Criterios de Aceitacao
*   **Dado** que estou logado como um Líder de Franquia e existem ciclos de planejamento cadastrados,
    **Quando** eu acesso a área de "Planejamento de OKRs",
    **Então** eu devo ver uma lista de todos os ciclos, ordenados do mais recente para o mais antigo.

*   **Dado** que um ciclo de planejamento tem sua data de início no futuro,
    **Quando** eu visualizo a lista de ciclos,
    **Então** o status exibido para este ciclo deve ser "Futuro".

*   **Dado** que um ciclo de planejamento tem sua data de início no passado e sua data de fim no futuro,
    **Quando** eu visualizo a lista de ciclos,
    **Então** o status exibido para este ciclo deve ser "Ativo".

*   **Dado** que um ciclo de planejamento tem sua data de fim no passado,
    **Quando** eu visualizo a lista de ciclos,
    **Então** o status exibido para este ciclo deve ser "Encerrado".

*   **Dado** que estou visualizando a lista de ciclos de planejamento,
    **Quando** eu clico no nome de um ciclo específico (ex: "Q3 2024"),
    **Então** sou redirecionado para a página que detalha os Objetivos e Key Results daquele ciclo.

## Casos Limite
*   **Nenhum Ciclo Cadastrado:**
    *   **Dado** que nenhum ciclo de planejamento foi criado no sistema ainda,
    *   **Quando** um usuário acessa a página de visualização de ciclos,
    *   **Então** o sistema deve exibir uma mensagem clara indicando que não há ciclos cadastrados (ex: "Nenhum ciclo de planejamento encontrado.") e, se aplicável, um botão para criar o primeiro ciclo.

*   **Grande Volume de Ciclos:**
    *   **Dado** que existem muitos ciclos cadastrados (ex: mais de 5 anos de ciclos trimestrais),
    *   **Quando** eu acesso a lista de ciclos,
    *   **Então** o sistema deve carregar a lista de forma performática, possivelmente utilizando paginação, para evitar lentidão.

*   **Ciclo com Datas Limítrofes:**
    *   **Dado** que hoje é a data de início exata de um ciclo,
    *   **Quando** eu visualizo a lista,
    *   **Então** o status do ciclo deve ser "Ativo".
    *   **Dado** que hoje é a data de fim exata de um ciclo,
    *   **Quando** eu visualizo a lista,
    *   **Então** o status do ciclo deve ser "Ativo".

## Fluxos Alternativos
*   **Filtrar Ciclos por Status:**
    *   **Dado** que estou visualizando a lista de ciclos,
    *   **Quando** eu aplico um filtro para ver apenas ciclos com status "Ativo",
    *   **Então** a lista é atualizada para mostrar apenas os ciclos que estão em andamento.

*   **Buscar por Nome do Ciclo:**
    *   **Dado** que estou visualizando a lista de ciclos,
    *   **Quando** eu digito "2023" em um campo de busca,
    *   **Então** a lista é atualizada para mostrar apenas os ciclos cujo nome contém "2023".

*   **Usuário sem Permissão:**
    *   **Dado** que um usuário sem permissão para ver planejamentos tenta acessar a página de ciclos,
    *   **Quando** ele navega para a URL correspondente,
    *   **Então** o sistema deve exibir uma mensagem de acesso negado ou redirecioná-lo para uma página inicial apropriada.