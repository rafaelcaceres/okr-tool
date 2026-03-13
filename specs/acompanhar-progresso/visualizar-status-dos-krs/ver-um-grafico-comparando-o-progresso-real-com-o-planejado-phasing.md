Com certeza! Baseado na história de usuário e no rico contexto fornecido, aqui está a especificação de desenvolvimento completa.

---

# Visualizar Gráfico Comparativo de Progresso do KR (Real vs. Planejado)

## Descrição
Como um Líder de Franquia, eu quero visualizar um gráfico que compara o progresso real de um Key Result (KR) com o seu progresso planejado (phasing) ao longo do tempo. Isso me permite identificar rapidamente desvios, entender a saúde do KR e comunicar o status de forma clara e visualmente impactante para a liderança sênior.

## Regras de Negocio
1.  **Fontes de Dados:** O gráfico deve exibir duas séries de dados distintas para um único KR:
    *   **Progresso Planejado (Phasing):** Os valores de meta definidos para cada período (ex: mês) durante o ciclo de planejamento.
    *   **Progresso Real:** Os valores de resultado efetivamente alcançados e reportados em cada período.
2.  **Tipo de Gráfico:** O formato padrão para a visualização deve ser um gráfico de linhas para demonstrar a evolução ao longo do tempo.
3.  **Eixo Horizontal (X):** O eixo X deve representar os períodos de tempo definidos para o ciclo (ex: Jan, Fev, Mar, ..., Dez). A granularidade do eixo deve corresponder à granularidade do planejamento (phasing).
4.  **Eixo Vertical (Y):** O eixo Y deve representar a unidade de medida do KR (ex: número de pacientes, %, valor monetário). A escala do eixo deve se ajustar automaticamente para acomodar os valores máximos do planejado e do real.
5.  **Disponibilidade do Gráfico:** O gráfico só deve ser exibido na página de detalhes de um KR se houver um Progresso Planejado (phasing) definido para ele.
6.  **Dados Futuros:**
    *   A linha de "Progresso Planejado" deve ser exibida por todo o ciclo de OKR.
    *   A linha de "Progresso Real" deve ser exibida apenas até o último período em que um valor foi reportado. Períodos futuros não devem exibir a linha de progresso real.
7.  **Legenda:** O gráfico deve conter uma legenda clara identificando as linhas "Planejado" e "Real".

## Criterios de Aceitacao
*   **Cenário 1: Visualização Padrão de um KR com Dados Completos**
    *   **Dado** que estou na página de detalhes de um KR que possui Progresso Planejado e Progresso Real reportado para alguns períodos.
    *   **Quando** a página é carregada.
    *   **Então** um gráfico de linhas deve ser exibido, contendo uma linha para "Planejado" e outra para "Real", com os eixos X (tempo) e Y (unidade do KR) corretamente configurados.

*   **Cenário 2: KR com Progresso Real Acima do Planejado**
    *   **Dado** que um KR teve um progresso real que superou o planejado em um determinado período.
    *   **Quando** eu visualizo o gráfico comparativo.
    *   **Então** a linha "Real" deve estar visivelmente acima da linha "Planejado" para aquele período.

*   **Cenário 3: KR com Progresso Real Abaixo do Planejado**
    *   **Dado** que um KR teve um progresso real inferior ao planejado em um determinado período.
    *   **Quando** eu visualizo o gráfico comparativo.
    *   **Então** a linha "Real" deve estar visivelmente abaixo da linha "Planejado" para aquele período.

*   **Cenário 4: Interação com Pontos de Dados**
    *   **Dado** que o gráfico de progresso está sendo exibido.
    *   **Quando** eu passo o mouse sobre um ponto de dados em qualquer uma das linhas.
    *   **Então** uma caixa de informações (tooltip) deve aparecer, exibindo o período, o tipo de dado ("Planejado" ou "Real") e o valor exato daquele ponto.

*   **Cenário 5: Atualização Dinâmica do Gráfico**
    *   **Dado** que estou visualizando o gráfico de um KR.
    *   **Quando** eu atualizo o valor do Progresso Real para o período atual.
    *   **Então** o gráfico deve ser atualizado instantaneamente para refletir o novo ponto de dados na linha "Real".

## Casos Limite
*   **KR sem Progresso Real Reportado:**
    *   Se um KR tem phasing definido, mas nenhum progresso real foi reportado ainda, o gráfico deve ser exibido mostrando apenas a linha completa do "Planejado". A linha "Real" não deve ser exibida.

*   **KR com Valores Negativos (se aplicável):**
    *   Se a natureza do KR permitir valores negativos (ex: redução de custos onde um aumento é negativo), o eixo Y do gráfico deve ser capaz de se ajustar para exibir valores abaixo de zero.

*   **Valores Reais para Períodos Futuros:**
    *   Se um usuário, por engano ou para simulação, inserir um valor de progresso real para um período futuro, o sistema deve aceitar e plotar o ponto no gráfico, conectando a linha "Real" até aquele ponto.

## Fluxos Alternativos
*   **KR sem Progresso Planejado (Phasing) Definido:**
    *   **Dado** que o usuário navega para a página de detalhes de um KR.
    *   **Quando** o sistema verifica que não existe um Progresso Planejado (phasing) para este KR.
    *   **Então** o espaço destinado ao gráfico deve exibir uma mensagem clara, como "Progresso Planejado (phasing) não foi definido para este KR", acompanhada de um botão ou link de ação para "Definir Planejamento".

*   **Exportação da Visualização:**
    *   **Dado** que o gráfico está sendo exibido corretamente.
    *   **Quando** o usuário clica em uma opção de "Exportar" ou "Salvar como Imagem" associada ao gráfico.
    *   **Então** o sistema deve gerar um arquivo de imagem (ex: PNG, JPG) do gráfico atual para download, permitindo que o usuário o utilize em apresentações.