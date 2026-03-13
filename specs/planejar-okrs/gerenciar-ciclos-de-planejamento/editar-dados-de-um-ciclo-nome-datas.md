Com certeza. Aqui está a especificação de desenvolvimento para a história de usuário "Editar dados de um ciclo (nome, datas)", seguindo o formato solicitado e enriquecida com o contexto fornecido.

---

# Editar Ciclo de Planejamento de OKRs

## Descricao
Como um **Líder de Franquia**, eu quero poder editar o nome, a data de início e a data de fim de um ciclo de planejamento já criado, para que eu possa corrigir erros de digitação ou ajustar o período do planejamento conforme necessário, garantindo que a estrutura de tempo para os OKRs da minha equipe esteja sempre precisa e atualizada.

## Regras de Negocio
1.  **Unicidade do Nome:** O nome de um ciclo de planejamento deve ser único em toda a organização. O sistema não deve permitir que dois ciclos tenham o mesmo nome.
2.  **Consistência das Datas:** A data de fim do ciclo deve ser sempre posterior à data de início.
3.  **Não Sobreposição de Ciclos:** Os períodos (intervalo entre data de início e fim) de diferentes ciclos de planejamento não podem se sobrepor. Um dia só pode pertencer a um único ciclo.
4.  **Edição de Ciclos com Dados:** Um ciclo que já contém OKRs com progresso (planejado ou realizado) pode ter suas datas alteradas, desde que a nova faixa de datas englobe completamente todas as datas de entradas de progresso existentes.
    -   *Exemplo:* Se um Key Result tem um progresso registrado em 15 de novembro, a data de fim do ciclo não pode ser alterada para 14 de novembro.
5.  **Impacto da Edição de Datas:** A alteração das datas de início ou fim de um ciclo *não* recalcula ou redistribui automaticamente o progresso planejado ("phasing") dos Key Results contidos nele.
6.  **Ciclos Concluídos:** Um ciclo que foi explicitamente marcado como "Concluído" ou "Arquivado" não pode ser editado. Seus dados são considerados históricos e imutáveis.
7.  **Campos Obrigatórios:** O nome, a data de início e a data de fim são campos obrigatórios para um ciclo de planejamento. Nenhum deles pode ser deixado em branco durante a edição.

## Criterios de Aceitacao
-   **Cenário 1: Edição bem-sucedida de nome e datas**
    -   **Dado** que eu sou um Líder de Franquia e existe um ciclo "Q4 2024" com datas de 01/10/2024 a 31/12/2024,
    -   **Quando** eu edito este ciclo, alterando o nome para "Planejamento Final Q4 2024" e as datas para 01/10/2024 a 15/01/2025 (e este período não conflita com outros ciclos),
    -   **Então** o ciclo é atualizado com o novo nome e as novas datas, e eu vejo uma mensagem de sucesso.

-   **Cenário 2: Tentativa de salvar com datas inválidas**
    -   **Dado** que estou na tela de edição de um ciclo de planejamento,
    -   **Quando** eu tento definir a data de fim para uma data anterior à data de início,
    -   **Então** o sistema exibe uma mensagem de erro informando que "A data de fim deve ser posterior à data de início" e não salva as alterações.

-   **Cenário 3: Tentativa de salvar com nome duplicado**
    -   **Dado** que já existe um ciclo de planejamento chamado "Q1 2025",
    -   **Quando** eu tento renomear um outro ciclo para "Q1 2025",
    -   **Então** o sistema exibe uma mensagem de erro informando que "O nome do ciclo já está em uso" e não salva as alterações.

-   **Cenário 4: Tentativa de criar sobreposição de datas com outro ciclo**
    -   **Dado** que existe um ciclo para o "Q1 2025" (01/01/2025 a 31/03/2025),
    -   **Quando** eu tento editar as datas do ciclo "Q4 2024" para terminar em 15/02/2025,
    -   **Então** o sistema exibe uma mensagem de erro informando que "O período do ciclo não pode se sobrepor a um ciclo existente" e não salva as alterações.

-   **Cenário 5: Tentativa de encurtar um ciclo para além de dados existentes**
    -   **Dado** que um ciclo possui um Key Result com progresso registrado na data 20/12/2024,
    -   **Quando** eu tento editar a data de fim deste ciclo para 19/12/2024,
    -   **Então** o sistema exibe uma mensagem de erro informando que "Não é possível alterar o período, pois existem registros de progresso fora das novas datas" e não salva as alterações.

-   **Cenário 6: Tentativa de editar um ciclo concluído**
    -   **Dado** que existe um ciclo marcado como "Concluído",
    -   **Quando** eu tento acessar a funcionalidade de edição para este ciclo,
    -   **Então** a opção de editar está desabilitada ou, se acessada por outro meio, o sistema exibe uma mensagem informando que "Ciclos concluídos não podem ser modificados".

## Casos Limite
-   **Campos Vazios:** Se o usuário apagar o conteúdo do campo de nome, data de início ou data de fim e tentar salvar, o sistema deve indicar que os campos são obrigatórios e impedir o salvamento.
-   **Edição Concorrente:** Se dois usuários tentarem editar o mesmo ciclo simultaneamente, o primeiro que salvar a alteração terá sucesso. O segundo usuário, ao tentar salvar, deverá receber uma notificação de que os dados foram alterados por outra pessoa e que ele precisa recarregar as informações antes de tentar salvar novamente.

## Fluxos Alternativos
-   **Cancelamento da Edição:**
    -   **Dado** que o usuário está na tela de edição de um ciclo e realizou alterações,
    -   **Quando** ele clica no botão "Cancelar" ou tenta navegar para fora da página,
    -   **Então** o sistema deve perguntar se ele deseja descartar as alterações não salvas. Se confirmar, as alterações são descartadas e ele é redirecionado para a tela anterior.

-   **Navegação Durante Edição:**
    -   **Dado** que o usuário fez alterações no formulário de edição de ciclo que ainda não foram salvas,
    -   **Quando** ele clica em um link de navegação principal do sistema ou no botão "Voltar" do navegador,
    -   **Então** o sistema deve exibir um aviso de "Você tem alterações não salvas. Deseja sair mesmo assim?" para prevenir a perda acidental de dados.