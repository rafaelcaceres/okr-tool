Com certeza! Aqui está a especificação de desenvolvimento para a história de filtrar Key Results por status, criada com base no contexto fornecido.

---

# Filtrar Key Results por Status de Progresso

## Descricao
Como um **Líder de Franquia** ou **Líder Sênior**, eu quero filtrar a lista de Key Results (KRs) por seu status de progresso (ex: Em Dia, Em Risco) na tela de relatório. Isso me permite focar rapidamente nos itens que mais precisam de atenção, otimizando minha análise de performance e a preparação para reuniões de estratégia.

## Regras de Negocio
1.  Os status de progresso disponíveis para filtro devem ser:
    *   **Em Dia**: O progresso realizado está de acordo ou acima do planejado.
    *   **Em Risco**: O progresso realizado está ligeiramente abaixo do planejado, indicando um risco potencial de não atingir a meta.
    *   **Atrasado**: O progresso realizado está significativamente abaixo do planejado, exigindo atenção imediata.
    *   **Concluído**: A meta do KR foi atingida (100% ou mais).
    *   **Não Iniciado**: Nenhum progresso foi reportado para o KR ainda.
2.  O usuário deve poder selecionar um ou múltiplos status para aplicar o filtro. A lógica de seleção múltipla é **OU** (ex: selecionar "Em Risco" e "Atrasado" exibirá KRs que estão em um *ou* outro estado).
3.  Por padrão, ao carregar a tela de relatório, nenhum filtro de status deve estar ativo, e todos os KRs da franquia devem ser exibidos.
4.  A aplicação de um filtro deve atualizar a lista de KRs visível em tempo real, sem a necessidade de recarregar a página.
5.  Deve haver uma opção clara e acessível para remover todos os filtros de status aplicados e retornar à visualização padrão (ex: um botão "Limpar Filtros").
6.  Se a combinação de filtros selecionados não retornar nenhum KR, uma mensagem informativa deve ser exibida ao usuário (ex: "Nenhum Key Result encontrado para os status selecionados.").
7.  A seleção de filtros do usuário deve ser mantida durante a sua sessão de navegação. Se o usuário navegar para outra página e depois retornar, os filtros aplicados anteriormente devem permanecer ativos.

## Criterios de Aceitacao
*   **Cenário 1: Filtrar por um único status**
    *   **Dado** que estou na página de relatório da minha franquia, visualizando todos os KRs.
    *   **Quando** eu seleciono o filtro de status "Em Risco".
    *   **Então** a lista deve ser atualizada para exibir apenas os KRs que possuem o status "Em Risco".

*   **Cenário 2: Filtrar por múltiplos status**
    *   **Dado** que estou na página de relatório e nenhum filtro está aplicado.
    *   **Quando** eu seleciono os filtros de status "Em Risco" e "Atrasado".
    *   **Então** a lista deve ser atualizada para exibir todos os KRs que possuem o status "Em Risco" **OU** o status "Atrasado".

*   **Cenário 3: Limpar os filtros aplicados**
    *   **Dado** que filtrei a lista de KRs pelo status "Concluído".
    *   **Quando** eu clico na opção "Limpar Filtros".
    *   **Então** todos os filtros de status são removidos e a lista volta a exibir todos os KRs da franquia.

*   **Cenário 4: Filtro não retorna resultados**
    *   **Dado** que não existem KRs com o status "Não Iniciado" na minha franquia.
    *   **Quando** eu aplico o filtro de status "Não Iniciado".
    *   **Então** a lista de KRs deve ficar vazia e uma mensagem "Nenhum Key Result encontrado para os status selecionados" deve ser exibida.

*   **Cenário 5: Visualização padrão ao carregar a página**
    *   **Dado** que sou um Líder de Franquia.
    *   **Quando** eu acesso a página de relatório pela primeira vez na minha sessão.
    *   **Então** eu vejo a lista completa de KRs, sem nenhum filtro de status pré-selecionado.

## Casos Limite
*   **KR sem status definido:** Se, por um erro de dados, um KR não tiver um status atribuído, ele não deve aparecer em nenhuma visualização filtrada por status. Ele só deve ser visível na visualização padrão (sem filtros).
*   **Mudança de status em tempo real:** Se um usuário está com um filtro ativo (ex: "Em Dia") e, em paralelo, o status de um KR visível muda para "Em Risco" (devido a uma atualização automática ou de outro usuário), a lista na tela do usuário atual não deve mudar automaticamente. A mudança só será refletida se o usuário recarregar a página ou reaplicar os filtros, evitando mudanças inesperadas na interface.

## Fluxos Alternativos
*   **Fluxo A1: Desmarcar todas as opções de filtro**
    *   **Dado** que o usuário aplicou um ou mais filtros de status.
    *   **Quando** ele desmarca manualmente todas as opções de status que estavam selecionadas.
    *   **Então** o comportamento deve ser o mesmo de "Limpar Filtros": a lista é redefinida para exibir todos os KRs.

*   **Fluxo A2: Adicionar um novo status a um filtro existente**
    *   **Dado** que a lista de KRs já está filtrada para exibir apenas os que estão "Atrasados".
    *   **Quando** o usuário decide também selecionar o status "Em Risco", sem desmarcar "Atrasado".
    *   **Então** a lista de KRs deve ser atualizada para incluir tanto os itens "Atrasados" quanto os "Em Risco".