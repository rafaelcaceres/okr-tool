Com certeza! Baseado no rico contexto fornecido, aqui está a especificação de desenvolvimento para a história de usuário solicitada.

---

# Visualizar Progresso Planejado (Phasing) do Key Result

## Descrição
Como um Líder de Franquia, quero visualizar o progresso planejado (phasing) de um Key Result em um gráfico de linha, para que eu possa entender a trajetória esperada de alcance da meta ao longo do tempo e comunicar de forma clara e visualmente impactante o plano para a liderança sênior.

## Regras de Negocio
1.  **Fonte dos Dados**: O gráfico deve ser gerado exclusivamente a partir dos dados de "Progresso Planejado" (phasing) que foram previamente definidos para o Key Result específico.
2.  **Eixo X (Tempo)**: O eixo horizontal do gráfico deve representar os períodos de tempo definidos para o ciclo do OKR (ex: semanas, meses do trimestre). A granularidade deve ser consistente com a forma como o phasing foi planejado.
3.  **Eixo Y (Métrica)**: O eixo vertical deve representar a métrica do Key Result (ex: número de pacientes, valor monetário, percentual). A escala do eixo deve se ajustar dinamicamente para acomodar o valor da meta final.
4.  **Linha de Progresso Planejado**: O gráfico deve exibir uma única linha contínua representando o valor **cumulativo** do progresso planejado ao final de cada período.
5.  **Indicação da Meta Final**: O gráfico deve exibir um indicador visual claro (ex: uma linha horizontal pontilhada) que represente o valor da meta final do Key Result. Isso fornece contexto sobre o quão ambicioso é o plano em cada período.
6.  **Ausência de Dados**: Se um Key Result não tiver um progresso planejado (phasing) definido, o gráfico não deve ser exibido. Em seu lugar, deve aparecer uma mensagem clara instruindo o usuário a definir o planejamento.
7.  **Interatividade (Tooltip)**: Ao passar o mouse sobre um ponto de dados na linha do gráfico, uma caixa de informações (tooltip) deve ser exibida, mostrando o período específico e o valor planejado cumulativo correspondente.
8.  **Contexto**: O gráfico sempre deve ser exibido no contexto de um único Key Result. Ele não deve agregar ou misturar dados de múltiplos Key Results.
9.  **Preparação para o Futuro**: O design do gráfico deve prever a inclusão futura de uma segunda linha para representar o "Progresso Realizado", permitindo a comparação visual entre planejado e realizado.

## Criterios de Aceitacao
*   **Dado** que um Key Result possui um progresso planejado (phasing) definido para cada mês do trimestre (ex: M1: 100, M2: 150, M3: 250), com uma meta final de 500.
    **Quando** o usuário visualiza a página de detalhes desse Key Result,
    **Então** um gráfico de linha é exibido, mostrando a linha "Planejado" com os seguintes pontos de dados cumulativos: (M1, 100), (M2, 250), (M3, 500).

*   **Dado** que o gráfico de progresso planejado é exibido,
    **Quando** o usuário passa o mouse sobre o ponto de dados correspondente ao segundo mês (M2),
    **Então** uma caixa de informações (tooltip) aparece mostrando "Mês 2: 250".

*   **Dado** que o Key Result tem uma meta final definida (ex: 1.000 pacientes),
    **Quando** o usuário visualiza o gráfico de progresso,
    **Então** o gráfico exibe uma linha de referência horizontal no nível "1.000" do eixo Y, identificada como "Meta".

*   **Dado** que um Key Result foi criado mas ainda não possui um progresso planejado (phasing) definido,
    **Quando** o usuário visualiza a página de detalhes desse Key Result,
    **Então** no lugar do gráfico é exibida uma mensagem informativa, como "Defina o progresso planejado para visualizar a projeção de resultados."

## Casos Limite
*   **Planejamento com Valor Zero**: Se o progresso planejado para os períodos iniciais for zero, a linha do gráfico deve começar na origem e permanecer no eixo X até o primeiro período com um valor planejado maior que zero.
*   **Planejamento "Flat"**: Se o progresso planejado for o mesmo por vários períodos consecutivos, a linha do gráfico deve se tornar uma linha horizontal durante esses períodos.
*   **Planejamento Agressivo no Final**: Se a maior parte do progresso estiver planejada para o último período, o gráfico mostrará uma linha com crescimento lento no início e um salto acentuado no final. O gráfico deve renderizar isso corretamente.
*   **Plano Excede a Meta**: Se a soma dos valores planejados ultrapassar a meta final definida para o Key Result, o eixo Y do gráfico deve se ajustar automaticamente para exibir o valor máximo planejado, e a linha "Planejado" ultrapassará a linha de "Meta".

## Fluxos Alternativos
*   **Navegação para Edição do Plano**: O usuário, ao visualizar o gráfico, pode identificar a necessidade de ajustar o plano. A interface deve fornecer um caminho claro e acessível (ex: um botão ou link "Editar Planejamento") que o leve diretamente para a funcionalidade de edição do phasing daquele Key Result.
*   **Visualização de Ciclos Anteriores**: Ao visualizar um OKR de um ciclo já encerrado, o gráfico de progresso planejado deve ser exibido como um registro histórico de como o progresso foi planejado naquela época, sem a possibilidade de edição.