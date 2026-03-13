Com certeza! Segue a especificação de desenvolvimento focada em regras de negócio para a história solicitada, utilizando o contexto fornecido.

---

# Explorar Detalhes da Franquia a partir da Visão Consolidada

## Descrição
Como um Líder Sênior (C-Level), eu quero poder clicar em um resultado consolidado na visão estratégica ("One Sanofi") e ver um detalhamento de como cada franquia individual contribuiu para aquele número. Isso me permitirá identificar rapidamente as áreas de alto e baixo desempenho e fazer perguntas mais direcionadas durante as reuniões estratégicas, sem precisar interromper o fluxo para solicitar dados adicionais.

## Regras de Negocio
1.  Um resultado consolidado (e.g., um Key Result a nível "One Sanofi") deve ser a agregação (soma, média, etc., conforme definido para o KR) dos resultados correspondentes das franquias individuais.
2.  Cada valor que compõe o resultado consolidado deve manter um vínculo direto e rastreável com sua franquia de origem.
3.  A ação de "drill-down" deve estar disponível para cada Key Result apresentado na visão consolidada.
4.  Ao realizar o drill-down, a visão detalhada deve listar todas as franquias que contribuem para aquele Key Result específico.
5.  A visão detalhada por franquia deve exibir, no mínimo:
    *   Nome da Franquia.
    *   O valor atual do Key Result para aquela franquia.
    *   A meta planejada (phasing) para o período.
    *   O status de progresso (e.g., verde, amarelo, vermelho) daquela franquia.
    *   Quaisquer comentários ou justificativas relevantes inseridos pelo Líder da Franquia.
6.  O Líder Sênior deve ter permissão para visualizar os detalhes de todas as franquias que contribuem para a visão consolidada.
7.  A soma (ou agregação) dos valores individuais das franquias exibidos no drill-down deve ser consistente com o valor total mostrado na visão consolidada.

## Criterios de Aceitacao
*   **Cenário 1: Análise de um resultado consolidado com sucesso**
    *   **Dado** que um Líder Sênior está na tela de visão consolidada ("One Sanofi").
    *   **E** um Key Result, como "Pacientes Impactados", mostra um valor total de "5.000".
    *   **Quando** ele clica no Key Result "Pacientes Impactados".
    *   **Então** uma visão detalhada é exibida, listando as franquias contribuintes, como por exemplo:
        *   "Franquia A | Status: Verde | Atual: 2.500 | Meta: 2.400"
        *   "Franquia B | Status: Amarelo | Atual: 1.500 | Meta: 2.000"
        *   "Franquia C | Status: Verde | Atual: 1.000 | Meta: 1.000"

*   **Cenário 2: Análise de um resultado com comentários de justificativa**
    *   **Dado** que o Líder da "Franquia B" adicionou um comentário ao seu Key Result: "Atraso na campanha de marketing, plano de recuperação em ação".
    *   **E** o Líder Sênior está visualizando os detalhes do drill-down conforme o cenário anterior.
    *   **Quando** ele visualiza a linha da "Franquia B".
    *   **Então** ele deve ver uma indicação de que há um comentário e ser capaz de visualizá-lo.

## Casos Limite
*   **Key Result com apenas uma franquia contribuinte:**
    *   Se um Key Result consolidado for composto pela contribuição de apenas uma franquia, ao realizar o drill-down, o sistema deve exibir os detalhes apenas daquela franquia. O valor consolidado e o valor da franquia serão idênticos.

*   **Key Result sem nenhuma contribuição:**
    *   Se um Key Result for definido a nível consolidado, mas nenhuma franquia o tiver adotado ou reportado progresso ainda, o valor consolidado será zero. Ao tentar o drill-down, o sistema deve exibir uma mensagem clara, como "Nenhuma franquia está contribuindo para este resultado no momento", em vez de uma tela vazia ou um erro.

*   **Franquia com dados pendentes de atualização:**
    *   Se uma franquia que contribui para um KR não atualizou seu progresso para o período corrente, na visão de drill-down ela deve ser listada com um status claro, como "Pendente de atualização" ou "Dados não reportados", para evitar interpretações incorretas do resultado consolidado.

## Fluxos Alternativos
*   **Retorno à Visão Consolidada:**
    *   Após realizar o drill-down e analisar os detalhes, o usuário deve ter uma ação clara e intuitiva (e.g., um botão "Voltar", fechar um modal, um breadcrumb) para retornar à visão consolidada original, mantendo qualquer filtro ou contexto anterior.

*   **Tentativa de Drill-Down por Usuário sem Permissão:**
    *   Se um usuário que não seja um Líder Sênior (e.g., um Líder de Franquia) acessar uma visão consolidada, a funcionalidade de drill-down para ver detalhes de *outras* franquias não deve estar disponível ou deve ser desabilitada, respeitando as permissões de acesso aos dados.