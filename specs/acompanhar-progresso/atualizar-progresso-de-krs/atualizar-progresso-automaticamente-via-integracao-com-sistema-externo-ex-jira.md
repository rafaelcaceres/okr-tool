Claro, aqui está a especificação completa para a história de usuário solicitada, utilizando o contexto fornecido e seguindo a estrutura definida.

---

# Atualizar Progresso de Key Result via Integração Externa

## Descrição
Para reduzir o trabalho manual e aumentar a acurácia dos dados, esta história permite que o progresso de um Key Result (KR) seja atualizado automaticamente. A atualização será baseada em dados provenientes de um sistema externo onde as iniciativas operacionais são gerenciadas (ex: Jira). Isso garante que o progresso estratégico refletido na plataforma de OKRs esteja sempre sincronizado com a execução real das tarefas, beneficiando tanto o Membro da Equipe (que evita o retrabalho) quanto o Líder de Franquia (que obtém dados mais precisos e frequentes).

## Regras de Negócio
1.  **Vínculo Explícito:** Um Key Result só pode ser atualizado automaticamente se estiver explicitamente vinculado a uma fonte de dados em um sistema externo.
2.  **Configuração da Medida:** Ao vincular um KR, o usuário deve configurar como o progresso será calculado a partir da fonte externa. Exemplos de configuração:
    *   Contagem de itens que atendem a um critério (ex: número de tarefas com status "Done").
    *   Soma de um campo numérico de itens que atendem a um critério (ex: soma de "Story Points" de tarefas concluídas).
3.  **Fonte da Verdade:** A atualização mais recente, seja ela manual ou automática via integração, prevalece. Todas as atualizações, incluindo sua origem (ex: "Automática via Integração" ou "Manual por [Nome do Usuário]"), devem ser registradas no histórico do KR.
4.  **Sincronização:** A atualização automática ocorre através de um processo de sincronização. Este processo pode ser agendado para rodar periodicamente ou ser acionado manualmente por um usuário com permissão.
5.  **Consistência Pós-Atualização:** Após qualquer atualização de valor (manual ou automática), o sistema deve recalcular automaticamente o percentual de atingimento do KR e atualizar seu status de saúde (farol: verde, amarelo, vermelho), se aplicável.
6.  **Desativação da Integração:** O usuário deve poder desativar ou remover o vínculo de integração de um KR a qualquer momento. Uma vez desvinculado, o KR retorna ao modo de atualização exclusivamente manual.
7.  **Isolamento de Falhas:** Uma falha na atualização de um KR específico (ex: dados inválidos da fonte externa) não deve impedir a atualização de outros KRs configurados corretamente durante o mesmo processo de sincronização.

## Critérios de Aceitação
*   **Cenário 1: Sincronização bem-sucedida**
    *   **Dado** que um KR com meta "10" está vinculado a uma consulta no sistema externo que retorna 5 itens concluídos,
    *   **Quando** o processo de sincronização for executado,
    *   **Então** o valor atual do KR deve ser atualizado para "5", seu progresso deve ser exibido como 50%, e seu histórico deve registrar um evento de "Atualização via Integração".

*   **Cenário 2: Atualização manual sobrepõe a automática**
    *   **Dado** que um KR foi atualizado automaticamente para o valor "5",
    *   **Quando** um Líder de Franquia atualiza manualmente o valor do mesmo KR para "6",
    *   **Então** o valor atual do KR deve ser "6" e seu histórico deve registrar um evento de "Atualização manual por [Nome do Usuário]".

*   **Cenário 3: Sincronização subsequente sobrepõe a manual**
    *   **Dado** que um KR foi atualizado manualmente para o valor "6", mas a consulta no sistema externo agora retorna 7 itens concluídos,
    *   **Quando** o processo de sincronização for executado novamente,
    *   **Então** o valor atual do KR deve ser atualizado para "7" e seu histórico deve registrar um novo evento de "Atualização via Integração".

*   **Cenário 4: Desvinculando um KR da integração**
    *   **Dado** que um KR está configurado para atualização automática,
    *   **Quando** o usuário remove o vínculo com o sistema externo,
    *   **Então** o KR não deve mais ser atualizado por processos de sincronização futuros e só poderá ser atualizado manualmente.

*   **Cenário 5: Status de saúde é recalculado após sincronização**
    *   **Dado** que um KR atualizado automaticamente atinge um limiar que muda seu status (ex: de "Em risco" para "No caminho"),
    *   **Quando** a sincronização atualiza seu valor,
    *   **Então** o status de saúde (farol) do KR deve ser recalculado e exibido corretamente na interface.

## Casos Limite
*   **Falha de Conexão com Sistema Externo:**
    *   Se o sistema não conseguir se conectar à fonte de dados externa (ex: API indisponível, credenciais inválidas), o processo de sincronização para os KRs afetados deve falhar de forma controlada.
    *   O valor atual do KR não deve ser alterado.
    *   Um erro deve ser registrado no sistema e, se possível, um alerta deve ser enviado a um administrador.

*   **Consulta Externa Retorna Vazio ou Nenhum Resultado:**
    *   Se a consulta configurada no sistema externo não retornar nenhum item, o valor atual do KR deve ser atualizado para "0". O sistema não deve interpretar isso como um erro.

*   **Dados Inesperados da Fonte Externa:**
    *   Se a fonte externa retornar dados em um formato inesperado para um KR específico (ex: um texto onde se esperava um número), a atualização daquele KR específico deve ser ignorada.
    *   Um erro detalhado deve ser registrado para o KR em questão, e o processo de sincronização deve continuar para os demais KRs.

*   **Remoção de Itens na Fonte Externa:**
    *   Se o número de itens na fonte externa diminuir (ex: uma tarefa foi reaberta e não atende mais ao critério de "concluída"), a sincronização deve refletir essa regressão, atualizando o valor do KR para um número menor.

## Fluxos Alternativos
*   **Acionamento Manual da Sincronização:**
    *   Um usuário com permissão (ex: Líder de Franquia) pode acionar manualmente a sincronização de todos os KRs de sua franquia a qualquer momento, fora do ciclo agendado, por meio de um botão "Sincronizar Agora". Isso é útil para obter os dados mais recentes imediatamente antes de uma reunião de status.

*   **Reconfiguração do Vínculo de Integração:**
    *   Um usuário pode editar a configuração do vínculo de um KR existente (ex: alterar a consulta no Jira). Na próxima sincronização (manual ou agendada), o sistema deve usar a nova configuração para buscar os dados e atualizar o progresso do KR.