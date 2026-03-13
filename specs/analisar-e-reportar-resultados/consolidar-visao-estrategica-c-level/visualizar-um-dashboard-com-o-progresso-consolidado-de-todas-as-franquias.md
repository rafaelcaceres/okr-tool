Claro, aqui está a especificação de desenvolvimento para a história solicitada, seguindo o formato e as diretrizes fornecidas.

---

# Visualizar Dashboard Estratégico com Progresso Consolidado das Franquias

## Descrição
Permite ao Líder Sênior (C-Level) obter uma visão macro e comparativa do progresso dos OKRs de todas as franquias em um único local. O objetivo é facilitar a identificação rápida de riscos, oportunidades e o desempenho geral da organização ("visão One Sanofi"), otimizando o tempo em reuniões estratégicas e apoiando a tomada de decisão.

## Regras de Negocio
1.  **Consolidação Total:** O dashboard deve exibir os dados de progresso de **todas** as franquias ativas na plataforma.
2.  **Métrica de Progresso Agregado:** Para cada franquia, deve ser exibida uma métrica de progresso geral. Essa métrica representa a consolidação do avanço de todos os seus Key Results para o período selecionado.
3.  **Indicador de Saúde (Status):** Cada franquia deve ter um indicador de saúde visual (ex: verde, amarelo, vermelho) que resume o status consolidado de seus Key Results.
    *   **Verde (No Caminho):** A maioria dos KRs está no caminho ou acima do planejado.
    *   **Amarelo (Atenção):** Existem KRs com desvios significativos que requerem atenção.
    *   **Vermelho (Em Risco):** Existem KRs com desvios críticos que comprometem o atingimento dos objetivos.
4.  **Filtro por Período:** O usuário deve ser capaz de filtrar a visualização do dashboard por um ciclo de planejamento específico (ex: Q3 2024, Q4 2024). O padrão deve ser o período atual.
5.  **Dados Atualizados:** As informações exibidas no dashboard devem refletir o último progresso reportado para cada Key Result.
6.  **Navegação para Detalhes (Drill-down):** O dashboard deve funcionar como um ponto de partida. Ao selecionar uma franquia específica, o usuário deve ser direcionado para a visão detalhada dos OKRs daquela franquia.
7.  **Permissão de Acesso:** Apenas usuários com perfil de Líder Sênior (ou superior) podem acessar esta visão consolidada.

## Criterios de Aceitacao
*   **Dado** que sou um usuário com perfil "Líder Sênior" e estou logado no sistema
    **Quando** eu acesso a página principal ou o menu de relatórios
    **Então** eu devo visualizar o "Dashboard Consolidado de Franquias".

*   **Dado** que estou no Dashboard Consolidado
    **Quando** a página carrega
    **Então** eu devo ver uma lista ou um conjunto de cartões, onde cada um representa uma franquia.

*   **Dado** que estou visualizando a lista de franquias no dashboard
    **Quando** eu observo o cartão de uma franquia específica
    **Então** eu devo ver claramente o nome da franquia, seu percentual de progresso consolidado e um indicador de saúde visual (cor).

*   **Dado** que estou no Dashboard Consolidado
    **Quando** eu seleciono um ciclo de planejamento diferente (ex: "Q2 2024") no filtro de período
    **Então** o dashboard deve ser atualizado para exibir apenas o progresso consolidado das franquias referente àquele ciclo.

*   **Dado** que uma franquia está com o status "Em Risco" (vermelho) no dashboard
    **Quando** eu clico no cartão ou no nome dessa franquia
    **Então** eu sou redirecionado para a página de detalhes dos OKRs daquela franquia, para poder investigar a causa.

*   **Dado** que uma franquia ainda não reportou nenhum progresso para seus KRs no período selecionado
    **Quando** eu visualizo seu cartão no dashboard
    **Então** o progresso consolidado deve ser exibido como "0%".

## Casos Limite
*   **Nenhuma Franquia Cadastrada:** Se não houver nenhuma franquia cadastrada no sistema, o dashboard deve exibir uma mensagem clara, como "Nenhuma franquia encontrada para exibir."
*   **Franquia Sem OKRs no Período:** Se uma franquia existir mas não tiver nenhum Objetivo ou Key Result cadastrado para o período selecionado, seu cartão no dashboard deve indicar claramente essa situação (ex: "Nenhum OKR definido para este período").
*   **Período de Planejamento Vazio:** Se não houver nenhum ciclo de planejamento cadastrado no sistema, o filtro de período deve estar desabilitado ou indicar que não há períodos para selecionar.

## Fluxos Alternativos
*   **Retorno da Visão Detalhada:**
    *   **Dado** que eu naveguei do dashboard consolidado para a visão detalhada de uma franquia
    *   **Quando** eu aciono o comando para "voltar" (ex: botão "Voltar", breadcrumb)
    *   **Então** eu devo retornar para o Dashboard Consolidado, mantendo o filtro de período que eu havia selecionado anteriormente.

*   **Dashboard como Página Inicial:**
    *   **Dado** que sou um usuário com perfil "Líder Sênior"
    *   **Quando** eu realizo o login no sistema
    *   **Então** sou direcionado diretamente para o Dashboard Consolidado de Franquias como minha página inicial padrão.