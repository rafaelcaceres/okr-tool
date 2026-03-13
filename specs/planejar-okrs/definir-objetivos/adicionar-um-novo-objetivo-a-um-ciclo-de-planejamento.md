Com certeza! Baseado na sua solicitação e no rico contexto fornecido, aqui está a especificação de desenvolvimento para a história de usuário "Adicionar um novo Objetivo a um ciclo de planejamento".

---

# Adicionar Novo Objetivo a um Ciclo de Planejamento

## Descricao
Como um **Líder de Franquia**, eu quero adicionar um novo Objetivo a um ciclo de planejamento específico, para que eu possa estruturar as metas qualitativas da minha equipe e, posteriormente, associar os Key Results (Resultados-Chave) correspondentes.

## Regras de Negocio
1.  **Associação com Ciclo:** Um Objetivo deve estar sempre associado a um único ciclo de planejamento (ex: Q3 2024). Não pode existir um Objetivo sem um ciclo definido.
2.  **Propriedade da Franquia:** Todo Objetivo pertence a uma única franquia, correspondente à do usuário que o criou.
3.  **Título Obrigatório:** Um Objetivo deve, no mínimo, possuir um título descritivo. A criação não pode ser concluída sem este campo preenchido.
4.  **Unicidade do Título:** O título de um Objetivo deve ser único para a mesma franquia dentro do mesmo ciclo de planejamento para evitar duplicidade e confusão.
5.  **Estado Inicial:** Ao ser criado, um Objetivo assume um estado que permite edições futuras (ex: "Em Planejamento" ou "Rascunho"), até que o plano de OKRs do ciclo seja formalmente finalizado.
6.  **Limite de Caracteres:** O campo de título do Objetivo deve ter um limite máximo de 250 caracteres para garantir clareza e adequação à interface.
7.  **Função de Contêiner:** Um Objetivo serve como um agrupador para um ou mais Key Results. Embora a criação de Key Results seja uma etapa posterior, o sistema deve entender esta relação hierárquica desde a criação do Objetivo.

## Criterios de Aceitacao

### Cenário 1: Criação de um Objetivo com Sucesso
*   **Dado** que o Líder de Franquia está na tela de planejamento de um ciclo ativo.
*   **Quando** ele preenche um título válido e único para um novo Objetivo e confirma a criação.
*   **Então** o novo Objetivo deve ser exibido na lista de Objetivos daquele ciclo, associado à sua franquia e pronto para receber Key Results.

### Cenário 2: Tentativa de Criação sem Título
*   **Dado** que o Líder de Franquia está na tela de criação de um novo Objetivo.
*   **Quando** ele tenta salvar o Objetivo com o campo de título em branco.
*   **Então** o sistema deve exibir uma mensagem de erro clara informando que o título é obrigatório.
*   **E** o Objetivo não deve ser criado.

### Cenário 3: Tentativa de Criação com Título Duplicado
*   **Dado** que já existe um Objetivo com o título "Excelência Operacional na Jornada do Paciente" no ciclo de planejamento atual para a minha franquia.
*   **Quando** eu tento criar um novo Objetivo com o mesmo título "Excelência Operacional na Jornada do Paciente" no mesmo ciclo.
*   **Então** o sistema deve exibir uma mensagem de erro informando que já existe um Objetivo com este título no ciclo atual.
*   **E** o novo Objetivo não deve ser criado.

## Casos Limite
1.  **Título Excede o Limite de Caracteres:** Se o usuário tentar inserir um título com mais de 250 caracteres, o sistema deve impedi-lo de salvar e informar sobre o limite. A entrada de caracteres além do limite pode ser bloqueada ou truncada.
2.  **Criação em Ciclo Finalizado:** O usuário não deve ter a opção de adicionar novos Objetivos a um ciclo de planejamento que já foi encerrado ou finalizado. A interface deve indicar claramente o estado do ciclo e desabilitar a ação de criação.
3.  **Uso de Caracteres Especiais:** O campo de título deve tratar corretamente a entrada de caracteres especiais, acentos e diferentes codificações para evitar erros de exibição ou armazenamento.

## Fluxos Alternativos
1.  **Cancelamento da Criação:** O usuário inicia a criação de um novo Objetivo, preenche algumas informações, mas decide não continuar.
    *   **Dado** que o Líder de Franquia está no formulário de criação de um novo Objetivo.
    *   **Quando** ele seleciona a opção "Cancelar" ou fecha o formulário.
    *   **Então** nenhuma informação deve ser salva e o usuário deve ser retornado à tela anterior sem que o novo Objetivo seja criado.