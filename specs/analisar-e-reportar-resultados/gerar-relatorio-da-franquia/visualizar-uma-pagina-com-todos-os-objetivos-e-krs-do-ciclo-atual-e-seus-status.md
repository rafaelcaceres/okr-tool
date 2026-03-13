Claro. Aqui está a especificação de desenvolvimento completa, seguindo a estrutura solicitada e enriquecida com o contexto fornecido.

---

# Visualizar Relatório de Performance da Franquia

## Descricao
Como um Líder de Franquia, eu quero visualizar uma página que consolide todos os Objetivos e Key Results (KRs) da minha franquia para o ciclo de planejamento atual. A página deve exibir o progresso e o status (saúde) de cada item de forma clara e intuitiva, permitindo uma análise rápida da performance e facilitando a preparação para reportes à liderança sênior.

## Regras de Negocio
1.  **Escopo de Visualização**: A página deve exibir, por padrão, apenas os Objetivos e KRs pertencentes à franquia do usuário logado e referentes ao ciclo de planejamento atualmente ativo.
2.  **Estrutura Hierárquica**: A exibição deve seguir uma hierarquia clara: cada Objetivo deve ser apresentado como um item principal, com seus respectivos Key Results aninhados abaixo dele.
3.  **Dados do Key Result (KR)**: Para cada KR, devem ser exibidos os seguintes dados:
    *   Descrição do KR.
    *   Valor Inicial.
    *   Valor Meta.
    *   Valor Atual.
    *   Progresso (calculado como um percentual da meta atingida).
    *   Status de Saúde (Farol).
4.  **Cálculo do Status do KR (Farol)**: O status de cada KR é determinado pela comparação do progresso **realizado** contra o progresso **planejado** (phasing) para a data atual.
    *   **Verde**: O progresso realizado é igual ou superior ao progresso planejado.
    *   **Amarelo**: O progresso realizado está abaixo do planejado, mas dentro de uma margem de tolerância aceitável (ex: entre 90% e 99% do planejado).
    *   **Vermelho**: O progresso realizado está significativamente abaixo do planejado (ex: abaixo de 90% do planejado).
5.  **Cálculo do Status do Objetivo**: O status de um Objetivo é um reflexo agregado do status de seus KRs. A regra é "o pior status prevalece":
    *   Se pelo menos um KR estiver **Vermelho**, o Objetivo é **Vermelho**.
    *   Se nenhum KR estiver Vermelho, mas pelo menos um estiver **Amarelo**, o Objetivo é **Amarelo**.
    *   O Objetivo é **Verde** somente se todos os seus KRs forem Verdes.
6.  **Ciclo Atual**: O sistema deve ter uma definição clara de qual é o "ciclo atual" para filtrar os dados corretamente.
7.  **Dados Atualizados**: As informações de progresso e status exibidas devem refletir a última atualização registrada no sistema.

## Criterios de Aceitacao
*   **Dado** que estou logado como um Líder de Franquia,
    **Quando** eu acesso a página de relatório,
    **Então** eu devo ver uma lista de todos os Objetivos definidos para a minha franquia no ciclo atual.

*   **Dado** que um Objetivo está sendo exibido na página,
    **Quando** eu o inspeciono,
    **Então** eu devo ver todos os seus Key Results associados listados diretamente abaixo dele.

*   **Dado** que um KR tem um progresso realizado que excede o progresso planejado para a data,
    **Quando** eu visualizo o relatório,
    **Então** o status (farol) desse KR deve ser exibido como "Verde".

*   **Dado** que um KR tem um progresso realizado ligeiramente abaixo do planejado (dentro da tolerância),
    **Quando** eu visualizo o relatório,
    **Então** o status (farol) desse KR deve ser exibido como "Amarelo".

*   **Dado** que um KR tem um progresso realizado significativamente abaixo do planejado,
    **Quando** eu visualizo o relatório,
    **Então** o status (farol) desse KR deve ser exibido como "Vermelho".

*   **Dado** que um Objetivo possui três KRs (um Verde, um Amarelo, e um Vermelho),
    **Quando** eu visualizo o relatório,
    **Então** o status consolidado do Objetivo deve ser exibido como "Vermelho".

*   **Dado** que um Objetivo possui dois KRs (um Verde e um Amarelo),
    **Quando** eu visualizo o relatório,
    **Então** o status consolidado do Objetivo deve ser exibido como "Amarelo".

*   **Dado** que um Objetivo possui múltiplos KRs e todos estão com status "Verde",
    **Quando** eu visualizo o relatório,
    **Então** o status consolidado do Objetivo deve ser exibido como "Verde".

## Casos Limite
*   **Franquia sem OKRs no ciclo atual**: Se a franquia do usuário não tiver nenhum Objetivo ou KR definido para o ciclo atual, a página deve exibir uma mensagem clara e amigável informando a ausência de dados (ex: "Nenhum Objetivo definido para o ciclo atual."). A página não deve quebrar ou exibir um erro.
*   **KR sem progresso reportado**: Se um KR foi cadastrado mas ainda não teve nenhum progresso atualizado (Valor Atual = Valor Inicial), seu progresso deve ser exibido como 0% e seu status deve ser neutro ou "Não iniciado" (e não Vermelho, a menos que o planejado para o período já seja maior que zero).
*   **KR que excedeu a meta**: Se o Valor Atual de um KR ultrapassar o Valor Meta, o progresso deve ser exibido como >=100% e seu status deve ser "Verde". A visualização deve suportar valores acima de 100% sem quebrar o layout.
*   **Usuário sem franquia associada**: Se um usuário que não está associado a nenhuma franquia tentar acessar a página, ele deve ver uma mensagem de acesso negado ou ser redirecionado para uma página apropriada.

## Fluxos Alternativos
*   **Visualizar Ciclos Anteriores**:
    1.  O usuário localiza e interage com um seletor de ciclo na página.
    2.  O sistema exibe uma lista de ciclos de planejamento anteriores.
    3.  O usuário seleciona um ciclo anterior.
    4.  A página é recarregada, exibindo o snapshot final dos Objetivos, KRs e seus status para o ciclo selecionado.

*   **Navegar para Detalhes do KR**:
    1.  O usuário identifica um KR de interesse (ex: um que está com status "Vermelho").
    2.  O usuário clica no item do KR na lista.
    3.  O sistema redireciona o usuário para uma página de detalhes daquele KR, onde informações adicionais como histórico de progresso, comentários e iniciativas relacionadas podem ser visualizadas.