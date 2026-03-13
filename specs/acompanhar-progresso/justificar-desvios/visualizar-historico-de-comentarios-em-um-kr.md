Com certeza! Aqui está a especificação de desenvolvimento para a história "Visualizar histórico de comentários em um KR", seguindo o formato solicitado e enriquecida com o contexto do produto fornecido.

---

# Consultar Histórico de Comentários de um Key Result

## Descrição
Como um Líder de Franquia ou Líder Sênior, eu quero visualizar o histórico completo de comentários associados a um Key Result (KR) específico. Isso me permite entender a narrativa por trás do desempenho do KR, as justificativas para desvios (positivos ou negativos) e as ações que foram tomadas ao longo do tempo, facilitando a análise de performance e a tomada de decisão estratégica.

## Regras de Negócio
1.  **Ordem Cronológica:** O histórico de comentários deve sempre ser exibido em ordem cronológica decrescente, mostrando o comentário mais recente no topo da lista.
2.  **Conteúdo do Comentário:** Cada entrada no histórico deve exibir claramente:
    *   O nome do autor do comentário.
    *   A data e hora exatas da publicação.
    *   O texto completo do comentário.
3.  **Imutabilidade:** Uma vez que um comentário é publicado, ele não pode ser editado ou excluído. Isso garante a integridade e a fidelidade do histórico de justificativas.
4.  **Visibilidade:** Qualquer usuário com permissão para visualizar um Key Result também deve ter permissão para visualizar seu histórico de comentários. Não há uma regra de permissão separada para o histórico.
5.  **Estado Vazio:** Se um KR ainda não possui nenhum comentário, o sistema deve exibir uma mensagem clara e amigável indicando a ausência de histórico (ex: "Nenhum comentário foi adicionado a este KR ainda.").

## Criterios de Aceitacao
*   **Dado** que estou visualizando os detalhes de um Key Result que possui múltiplos comentários
    *   **Quando** eu acesso a funcionalidade de histórico de comentários
    *   **Então** eu devo ver uma lista de todos os comentários associados a esse KR, ordenados do mais recente para o mais antigo.
    *   **E** cada item da lista deve mostrar o nome do autor, a data/hora e o texto completo do comentário.

*   **Dado** que estou visualizando os detalhes de um Key Result que não possui nenhum comentário
    *   **Quando** eu acesso a funcionalidade de histórico de comentários
    *   **Então** eu devo ver uma mensagem informativa indicando que não há comentários para exibir.

*   **Dado** que estou na visualização do histórico de comentários de um KR
    *   **Quando** um novo comentário é adicionado por outro usuário
    *   **Então** o histórico deve ser atualizado para exibir o novo comentário no topo da lista na próxima vez que eu carregar a visualização.

## Casos Limite
*   **Comentários Longos:**
    *   **Cenário:** Um usuário escreve um comentário muito longo, com vários parágrafos.
    *   **Comportamento Esperado:** O sistema deve exibir o comentário completo de forma legível, sem quebrar o layout da página. O texto deve ter quebra de linha automática e, se necessário, uma barra de rolagem interna para o campo do comentário.
*   **Grande Volume de Comentários:**
    *   **Cenário:** Um Key Result possui um histórico extenso, com mais de 50 comentários acumulados ao longo de vários trimestres.
    *   **Comportamento Esperado:** Para manter a performance da aplicação, o sistema deve carregar inicialmente um número limitado de comentários (ex: os 20 mais recentes) e oferecer um mecanismo para carregar o restante sob demanda (ex: um botão "Carregar mais" ou paginação).
*   **Autor do Comentário Desativado:**
    *   **Cenário:** Um comentário foi feito por um Líder de Franquia que não faz mais parte da empresa e cujo usuário foi desativado no sistema.
    *   **Comportamento Esperado:** O comentário deve permanecer no histórico. O nome do autor deve continuar sendo exibido, possivelmente com uma indicação de que o usuário está inativo (ex: "Fulano de Tal (Inativo)"), para manter o contexto histórico. O comentário não deve ser removido.

## Fluxos Alternativos
*   **Acesso a partir da Visão Consolidada:**
    *   **Cenário:** Um Líder Sênior está na visão consolidada de todas as franquias e identifica um KR com status "vermelho". Ele quer entender o porquê rapidamente.
    *   **Comportamento Esperado:** A interface deve permitir que o Líder Sênior acesse o histórico de comentários (ou pelo menos o comentário mais recente) diretamente a partir da visão consolidada, sem a necessidade de navegar por múltiplas telas.