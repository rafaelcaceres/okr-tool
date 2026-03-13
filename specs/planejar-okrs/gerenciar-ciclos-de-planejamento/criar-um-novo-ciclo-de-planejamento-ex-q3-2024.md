Claro! Aqui está a especificação de desenvolvimento para a história "Criar um novo ciclo de planejamento", elaborada com base no contexto fornecido e focada em regras de negócio.

---

# Criar Novo Ciclo de Planejamento

## Descrição
Como um Líder de Franquia, eu quero criar um novo ciclo de planejamento (ex: "Q3 2024", "Anual 2025") para que eu possa ter um contêiner de tempo definido onde meus Objetivos e Key Results (OKRs) serão planejados, acompanhados e medidos.

## Regras de Negocio
1.  **Identificação do Ciclo:** Todo ciclo de planejamento deve possuir:
    *   Um **Nome** (ex: "Q3 2024").
    *   Uma **Data de Início**.
    *   Uma **Data de Fim**.

2.  **Unicidade do Nome:** O nome de um ciclo de planejamento deve ser único. Não podem existir dois ciclos com o mesmo nome.

3.  **Validade do Período:** A Data de Fim do ciclo deve ser posterior à Data de Início.

4.  **Não Sobreposição:** Os períodos de ciclos de planejamento não podem se sobrepor. Um novo ciclo não pode ser criado se suas datas de início ou fim estiverem dentro do intervalo de um ciclo já existente.

5.  **Status Inicial:** Todo ciclo recém-criado deve iniciar com o status **"Planejamento"**. Neste status, é possível adicionar e editar OKRs, mas o acompanhamento de progresso ainda não está ativo.

6.  **Ciclos Futuros:** É permitido criar ciclos de planejamento futuros (ex: criar o ciclo do Q4 enquanto o Q3 está ativo).

7.  **Ciclo Ativo Único:** Apenas um ciclo pode ter o status **"Ativo"** por vez. O status "Ativo" indica o período corrente de acompanhamento. (Nota: A transição de status de "Planejamento" para "Ativo" será tratada em outra história).

## Criterios de Aceitacao
*   **Cenário 1: Criação de um ciclo com sucesso**
    *   **Dado** que eu sou um Líder de Franquia na tela de gerenciamento de ciclos.
    *   **Quando** eu preencho o nome "Q4 2024", a data de início "01/10/2024" e a data de fim "31/12/2024", e clico em "Salvar".
    *   **Então** o novo ciclo "Q4 2024" é criado com o status "Planejamento" e aparece na lista de ciclos.

*   **Cenário 2: Tentativa de criar um ciclo com nome duplicado**
    *   **Dado** que já existe um ciclo de planejamento com o nome "Q3 2024".
    *   **Quando** eu tento criar um novo ciclo com o nome "Q3 2024".
    *   **Então** o sistema exibe uma mensagem de erro informando que "O nome do ciclo já está em uso" e o ciclo não é criado.

*   **Cenário 3: Tentativa de criar um ciclo com data de fim anterior à data de início**
    *   **Dado** que estou no formulário de criação de ciclo.
    *   **Quando** eu preencho a data de início como "01/07/2024" e a data de fim como "30/06/2024".
    *   **Então** o sistema exibe uma mensagem de erro informando que "A data de fim deve ser posterior à data de início" e o ciclo não é criado.

*   **Cenário 4: Tentativa de criar um ciclo com datas sobrepostas a um ciclo existente**
    *   **Dado** que já existe um ciclo de "01/07/2024" a "30/09/2024".
    *   **Quando** eu tento criar um novo ciclo com data de início "15/09/2024" e data de fim "15/12/2024".
    *   **Então** o sistema exibe uma mensagem de erro informando que "O período informado se sobrepõe a um ciclo existente" e o ciclo não é criado.

## Casos Limite
*   **Campos Vazios:** O usuário não deve conseguir salvar um ciclo sem preencher todos os campos obrigatórios (Nome, Data de Início, Data de Fim). O sistema deve indicar quais campos precisam ser preenchidos.
*   **Primeiro Ciclo do Sistema:** O sistema deve permitir a criação do primeiro ciclo sem erros, já que não haverá outros ciclos para validar sobreposição.
*   **Limites de Datas:** O sistema deve lidar graciosamente com a seleção de datas muito distantes no passado ou no futuro, aplicando um intervalo razoável se necessário.
*   **Tamanho do Nome:** O nome do ciclo deve ter um limite máximo de caracteres para evitar quebras de layout na interface.

## Fluxos Alternativos
*   **Cancelamento da Criação:**
    *   **Dado** que o Líder de Franquia está preenchendo o formulário para criar um novo ciclo.
    *   **Quando** ele clica no botão "Cancelar".
    *   **Então** o formulário é fechado, nenhuma informação é salva e ele retorna à tela de listagem de ciclos.
*   **Alerta de Saída Não Salva:**
    *   **Dado** que o Líder de Franquia preencheu ou alterou informações no formulário de criação.
    *   **Quando** ele tenta navegar para outra página do sistema sem salvar.
    *   **Então** o sistema deve exibir um alerta perguntando se ele tem certeza que deseja sair sem salvar as alterações.