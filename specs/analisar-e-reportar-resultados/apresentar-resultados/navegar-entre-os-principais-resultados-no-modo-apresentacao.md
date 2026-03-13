Claro, aqui está a especificação de desenvolvimento para a história solicitada, seguindo o formato e as diretrizes fornecidas.

---

# Navegar entre Objetivos e Key Results em Modo Apresentação

## Descrição
Como um Líder de Franquia, eu quero navegar de forma fluida e sequencial entre os Objetivos e seus respectivos Key Results (KRs) dentro de um modo de apresentação dedicado. O objetivo é facilitar uma narrativa clara e focada durante as reuniões com a alta liderança, permitindo que a discussão se concentre nos resultados e insights, em vez de na manipulação da ferramenta.

## Regras de Negócio
1.  O Modo Apresentação deve exibir os dados de uma única Franquia e de um único período de planejamento (ex: Q3 2024) por vez.
2.  A navegação principal deve ocorrer no nível de **Objetivos**. O usuário pode passar de um Objetivo para o outro (seguinte/anterior).
3.  Dentro de um Objetivo, deve ser possível navegar entre os **Key Results** associados a ele.
4.  A ordem de exibição dos Objetivos e dos Key Results no Modo Apresentação deve ser a mesma ordem definida na tela de planejamento/gerenciamento padrão, garantindo consistência e previsibilidade.
5.  Cada tela (seja de Objetivo ou KR) no Modo Apresentação deve exibir apenas informações essenciais para a discussão: Título, Status/Farol (verde, amarelo, vermelho), um resumo do progresso (ex: "75% do planejado" ou "3 de 5 marcos concluídos"), e um gráfico principal que ilustre o progresso ao longo do tempo (realizado vs. planejado).
6.  Os dados exibidos no Modo Apresentação devem ser um "snapshot" do momento em que o modo foi ativado. Não devem ocorrer atualizações em tempo real para evitar distrações ou inconsistências durante a apresentação.
7.  Deve haver um mecanismo claro e sempre visível para sair do Modo Apresentação e retornar à visão de relatório padrão.

## Critérios de Aceitação
-   **Dado** que um Líder de Franquia está na tela de relatório de sua franquia para um período específico
    -   **Quando** ele aciona a funcionalidade "Modo Apresentação"
    -   **Então** a interface deve mudar para uma visão limpa e focada, exibindo o primeiro Objetivo da lista.

-   **Dado** que o usuário está visualizando o Objetivo "N" no Modo Apresentação
    -   **Quando** ele aciona o controle de navegação "próximo"
    -   **Então** a tela deve ser atualizada para exibir os detalhes do Objetivo "N+1", mantendo o formato de apresentação.

-   **Dado** que o usuário está visualizando um Objetivo que possui Key Results associados
    -   **Quando** ele seleciona a opção para ver os detalhes dos KRs
    -   **Então** a visualização deve mudar para exibir o primeiro Key Result daquele Objetivo.

-   **Dado** que o usuário está visualizando o Key Result "K" de um Objetivo específico
    -   **Quando** ele aciona o controle de navegação "próximo KR"
    -   **Então** a tela deve ser atualizada para exibir o Key Result "K+1" do mesmo Objetivo, mantendo o contexto do Objetivo pai visível (ex: no título da página).

-   **Dado** que o usuário está visualizando o último Objetivo da lista
    -   **Quando** ele tenta navegar para o "próximo"
    -   **Então** o controle de navegação "próximo" deve estar desabilitado ou ausente.

-   **Dado** que o usuário está visualizando o último Key Result de um Objetivo
    -   **Quando** ele tenta navegar para o "próximo KR"
    -   **Então** o controle de navegação "próximo KR" deve estar desabilitado, indicando o fim da lista de KRs daquele Objetivo.

## Casos Limite
-   **Franquia sem Objetivos:** Se o usuário tentar entrar no Modo Apresentação para um período que não possui Objetivos definidos, o sistema deve exibir uma mensagem clara, como "Não há Objetivos definidos para este período", e não iniciar o modo.
-   **Objetivo sem Key Results:** Se o usuário estiver visualizando um Objetivo que não possui KRs associados, a opção de navegar ou detalhar os KRs deve estar desabilitada ou oculta para aquele Objetivo.
-   **Apenas um Objetivo:** Se houver apenas um Objetivo definido para o período, os controles de navegação "próximo" e "anterior" para Objetivos devem estar desabilitados.
-   **Apenas um Key Result:** Se um Objetivo tiver apenas um KR, os controles de navegação "próximo KR" e "anterior KR" devem estar desabilitados na visualização daquele KR.

## Fluxos Alternativos
-   **Navegação Direta para um Objetivo:**
    -   **Dado** que o usuário está no Modo Apresentação
    -   **Quando** ele acessa um menu ou lista de todos os Objetivos do período (ex: um menu suspenso ou uma barra lateral) e seleciona um Objetivo específico
    -   **Então** a visualização deve saltar diretamente para o Objetivo selecionado, sem precisar passar pelos intermediários.

-   **Retorno da visão de KR para a visão de Objetivo:**
    -   **Dado** que o usuário está navegando entre os Key Results de um Objetivo específico
    -   **Quando** ele aciona um controle de "Voltar para o Objetivo" ou um link de navegação (breadcrumb)
    -   **Então** a visualização deve retornar para a tela principal daquele Objetivo pai.

-   **Sair do Modo Apresentação:**
    -   **Dado** que o usuário está em qualquer ponto da navegação do Modo Apresentação
    -   **Quando** ele aciona o botão/link "Sair do Modo Apresentação"
    -   **Então** o sistema deve retornar à tela de relatório padrão da qual ele partiu originalmente.