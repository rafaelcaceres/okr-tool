Claro, aqui está a especificação completa para a história de usuário "Adicionar um Key Result a um Objetivo", seguindo o formato solicitado e utilizando o contexto fornecido.

---

# Adicionar um Resultado Chave (Key Result) a um Objetivo

## Descrição
Como um Líder de Franquia, eu quero poder adicionar um ou mais Resultados Chave (Key Results) a um Objetivo que já criei, para detalhar como o sucesso desse Objetivo será medido e acompanhado ao longo do período de planejamento.

## Regras de Negócio
1.  Um Key Result (KR) deve estar sempre associado a um, e apenas um, Objetivo. Um KR não pode existir de forma independente.
2.  O título de um KR deve ser único dentro do seu Objetivo pai para evitar ambiguidade.
3.  Todo KR deve ter um **título** descritivo, que esclareça o que está sendo medido.
4.  Todo KR deve ter um **Tipo de Medida** definido no momento da sua criação. Os tipos suportados são:
    *   **Numérico:** Medido por um número absoluto (ex: número de pacientes).
    *   **Percentual:** Medido em porcentagem (ex: 0% a 100%).
    *   **Financeiro:** Medido em valor monetário (ex: R$ 50.000).
    *   **Milestone (Marco):** Medido pela conclusão de um conjunto de tarefas ou entregas predefinidas.
5.  Para tipos de medida Numérico, Percentual e Financeiro, um KR deve obrigatoriamente ter:
    *   Um **Valor Inicial**.
    *   Um **Valor Alvo (Meta)**.
6.  Para o tipo de medida Milestone, um KR deve ter pelo menos um marco (milestone) definido. O progresso será calculado como "X de N marcos concluídos".
7.  O "Tipo de Medida" de um KR, uma vez definido e salvo, não pode ser alterado, pois isso invalidaria qualquer dado de progresso já registrado.
8.  Um KR deve ter um **responsável** designado (por padrão, o usuário que o está criando).
9.  Um Objetivo pode ter múltiplos Key Results associados. Não há um limite rígido, mas a boa prática de OKR sugere de 2 a 5 KRs por Objetivo.

## Criterios de Aceitação
*   **Cenário 1: Adicionar um Key Result Numérico**
    *   **Dado** que eu sou um Líder de Franquia e estou na página de detalhes de um Objetivo existente.
    *   **Quando** eu seleciono a opção "Adicionar Key Result".
    *   **E** preencho o título (ex: "Aumentar o número de pacientes impactados pelo programa X").
    *   **E** seleciono o tipo de medida "Numérico".
    *   **E** defino o valor inicial como "1000" e o valor alvo como "1500".
    *   **E** confirmo a criação.
    *   **Então** o novo Key Result deve ser exibido na lista de KRs associados ao Objetivo, mostrando o título, o responsável, e o progresso inicial como "1000 de 1500".

*   **Cenário 2: Adicionar um Key Result de Milestones**
    *   **Dado** que estou no formulário de criação de um novo Key Result.
    *   **Quando** eu preencho o título (ex: "Lançar a nova campanha de marketing digital").
    *   **E** seleciono o tipo de medida "Milestone".
    *   **E** adiciono 3 marcos: "Definir público-alvo", "Aprovar peças criativas" e "Iniciar veiculação".
    *   **E** confirmo a criação.
    *   **Então** o novo Key Result deve ser listado sob o Objetivo, com o progresso inicial exibido como "0/3 concluídos".

*   **Cenário 3: Adicionar um Key Result Financeiro**
    *   **Dado** que eu sou um Líder de Franquia adicionando um KR a um Objetivo.
    *   **Quando** eu preencho o título "Atingir receita de vendas do produto Y".
    *   **E** seleciono o tipo de medida "Financeiro".
    *   **E** defino o valor inicial como "R$ 50.000" e o valor alvo como "R$ 80.000".
    *   **E** confirmo a criação.
    *   **Então** o novo Key Result deve ser exibido corretamente, com os valores monetários formatados de acordo com a moeda local (R$).

## Casos Limite
*   **Tentativa de salvar sem preenchimento obrigatório:**
    *   **Situação:** O usuário tenta salvar um KR sem preencher o título ou os valores inicial/alvo (para tipos numéricos).
    *   **Comportamento Esperado:** O sistema deve exibir uma mensagem de erro clara, indicando quais campos são obrigatórios, e não deve permitir que o KR seja salvo até que as informações sejam fornecidas.

*   **Valores inicial e alvo inválidos:**
    *   **Situação:** O usuário insere um valor inicial que é maior que o valor alvo para uma métrica que deveria crescer (ex: inicial 500, alvo 100).
    *   **Comportamento Esperado:** O sistema deve exibir um aviso ao usuário, questionando se a intenção é criar um KR de "redução" e pedir confirmação, ou simplesmente validar que o alvo deve ser maior que o início para métricas de crescimento.

*   **Título duplicado:**
    *   **Situação:** O usuário tenta criar um KR com um título que já existe dentro do mesmo Objetivo.
    *   **Comportamento Esperado:** O sistema deve impedir a criação e informar que "Já existe um Key Result com este título para este Objetivo".

*   **KR do tipo Milestone sem marcos definidos:**
    *   **Situação:** O usuário seleciona o tipo "Milestone", mas tenta salvar sem adicionar nenhum marco à lista.
    *   **Comportamento Esperado:** O sistema deve impedir o salvamento e exibir uma mensagem exigindo que pelo menos um marco seja definido.

## Fluxos Alternativos
*   **Cancelamento da criação:**
    *   **Caminho:** O usuário inicia o processo de adicionar um novo Key Result, preenche alguns campos, mas decide não continuar.
    *   **Resultado:** Ao clicar no botão "Cancelar" ou fechar o formulário/modal, nenhuma informação deve ser salva, e o sistema deve retornar à tela de detalhes do Objetivo sem nenhuma alteração.

*   **Adicionar KR a partir de um template (Futuro):**
    *   **Caminho:** Ao invés de preencher todos os campos manualmente, o usuário pode ter a opção de selecionar um KR de uma biblioteca de KRs comuns na organização.
    *   **Resultado:** O formulário é preenchido automaticamente com os dados do template, permitindo que o usuário apenas ajuste os valores alvo e o responsável antes de salvar. (Nota: Isso é uma sugestão para uma história futura, mas é um fluxo alternativo válido ao de criação "do zero").