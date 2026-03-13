Excelente. Com base na história de usuário e no rico contexto de produto fornecido (Personas, JTBD, Event Storming), aqui está a especificação de desenvolvimento completa.

---

# Ativar Modo Apresentação para Relatórios de OKR

## Descrição
Para o **Líder de Franquia**, que precisa reportar o progresso dos OKRs para a alta liderança (Líder Sênior), esta história permite ativar um "Modo Apresentação". Este modo simplifica a tela, removendo todos os elementos de navegação e edição, e foca em apresentar os resultados através de gráficos e indicadores visuais de alto impacto. O objetivo é facilitar a discussão estratégica durante as reuniões, minimizando distrações da ferramenta e maximizando a clareza da informação.

## Regras de Negocio
1.  **Ativação e Desativação:** O Modo Apresentação deve ser um estado que o usuário pode ativar e desativar a partir da tela de relatório de OKRs padrão.
2.  **Interface Simplificada:** Ao entrar no Modo Apresentação, todos os elementos de interface não essenciais para a apresentação devem ser ocultados. Isso inclui: menus de navegação principais, barras laterais, botões de edição, botões de configuração, e qualquer outro controle de interação que não seja para a apresentação em si.
3.  **Foco em Visualização:** A informação deve ser reorganizada para priorizar gráficos de progresso, indicadores de status (farol: verde, amarelo, vermelho), e os números chave (ex: atual vs. planejado). O design deve ser limpo e de fácil leitura a distância (em uma tela de projeção).
4.  **Estado de Somente Leitura:** O Modo Apresentação é estritamente para visualização. Nenhuma edição de dados, adição de comentários ou alteração de configuração de OKRs deve ser possível neste modo.
5.  **Consistência de Dados:** Os dados exibidos no Modo Apresentação devem ser um reflexo exato dos dados da tela de relatório padrão no momento da ativação.
6.  **Contexto Preservado:** Quaisquer filtros aplicados na tela padrão (ex: período de tempo, franquia específica) devem ser mantidos ao entrar no Modo Apresentação. O modo apresenta uma versão simplificada do *contexto já selecionado*.
7.  **Navegação Mínima:** A única navegação permitida dentro do Modo Apresentação deve ser a rolagem (scroll) da página para visualizar todos os objetivos e Key Results. Controles complexos como paginação ou aplicação de novos filtros não devem estar presentes.

## Criterios de Aceitacao
*   **Dado que** um Líder de Franquia está na tela de relatório de performance de sua franquia
    **Quando** ele clica no botão "Ativar Modo Apresentação"
    **Então** a interface é redesenhada, ocultando os menus de navegação e botões de edição, e exibindo os OKRs em um formato focado em gráficos e indicadores visuais.

*   **Dado que** o Modo Apresentação está ativo
    **Quando** o usuário inspeciona um Key Result
    **Então** ele deve ver claramente seu status (farol), um gráfico de progresso (planejado vs. realizado) e os valores numéricos principais, mas não deve ver botões como "Editar" ou "Adicionar Comentário".

*   **Dado que** o Modo Apresentação está ativo
    **Quando** o usuário clica no botão ou ícone para "Sair do Modo Apresentação"
    **Então** ele deve retornar para a tela de relatório de performance padrão, com todos os menus e controles de edição visíveis novamente.

*   **Dado que** o relatório foi filtrado para exibir apenas os resultados do "Q3 2024"
    **Quando** o Modo Apresentação é ativado
    **Então** o conteúdo exibido deve corresponder exclusivamente aos dados do "Q3 2024".

*   **Dado que** o Modo Apresentação está ativo
    **Quando** o usuário tenta clicar na área onde um campo de texto ou um valor numérico estaria para edição na visão padrão
    **Então** nenhuma ação de edição deve ser iniciada.

## Casos Limite
*   **Relatório sem Dados:**
    *   **Cenário:** O usuário ativa o Modo Apresentação para um período de tempo ou franquia que não possui OKRs cadastrados.
    *   **Comportamento Esperado:** O Modo Apresentação deve exibir uma mensagem clara e centralizada, como "Não há dados para apresentar para a seleção atual", em vez de uma tela em branco ou quebrada.

*   **Excesso de Informação:**
    *   **Cenário:** O relatório contém um número muito grande de Objetivos e Key Results (ex: 10 Objetivos com 5 KRs cada).
    *   **Comportamento Esperado:** O layout deve se adaptar de forma legível, permitindo a rolagem vertical da página sem que os elementos se sobreponham ou percam a clareza. O desempenho da renderização deve ser aceitável.

*   **Usuário com Permissão de Somente Leitura:**
    *   **Cenário:** Um usuário que já possui permissão apenas de visualização na plataforma tenta ativar o Modo Apresentação.
    *   **Comportamento Esperado:** A funcionalidade deve operar normalmente, pois o modo é inerentemente de somente leitura. O usuário conseguirá entrar e sair do modo sem problemas.

## Fluxos Alternativos
*   **Acesso Direto via URL:**
    *   **Cenário:** Um Líder de Franquia deseja compartilhar um link direto para a apresentação com um colega antes da reunião.
    *   **Fluxo:** O sistema pode oferecer uma URL específica para o Modo Apresentação (ex: `.../relatorio/franquia-x?modo=apresentacao`).
    *   **Critério de Aceitação:** **Dado que** um usuário com permissão de acesso abre esta URL específica, **Quando** a página carrega, **Então** o relatório já deve ser exibido diretamente no Modo Apresentação, sem a necessidade de ativação manual.

*   **Mudança de Contexto Durante a Apresentação:**
    *   **Cenário:** Durante uma reunião, um Líder Sênior pede para ver os resultados de um trimestre anterior.
    *   **Fluxo:** O apresentador (Líder de Franquia) deve sair do Modo Apresentação, alterar o filtro de período na tela de relatório padrão e, em seguida, reativar o Modo Apresentação com o novo contexto de dados.
    *   **Justificativa:** Para manter a simplicidade do Modo Apresentação, a aplicação de novos filtros não é permitida dentro dele. O fluxo alternativo é o caminho designado para esta necessidade.