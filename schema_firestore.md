# Dicionário de Dados - Firebase Firestore
## Estrutura de Coleções e Subcoleções do Sistema de OS

Este documento descreve a modelagem oficial recomendada para estruturar o banco de dados no **Google Cloud Firestore**, compatível com integrações como **FlutterFlow**.

---

### 1. Coleção: `users`
Armazena as informações cadastrais e níveis de permissão dos colaboradores.
* **Caminho:** `/users/{uid}` (Onde `{uid}` é o identificador gerado pelo Firebase Auth).

| Campo | Tipo no Firestore | Mapeamento FlutterFlow | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `uid` | `String` | `String` | ID único do usuário | `"usr_tecnico"` |
| `nome` | `String` | `String` | Nome completo | `"Lucas Nunes"` |
| `email` | `String` | `String` | E-mail corporativo | `"tecnico@empresa.com"` |
| `role` | `String` | `String` | Cargo/Acesso (`usuario`, `ti`, `diretor`) | `"ti"` |
| `ativo` | `Boolean` | `Boolean` | Status de ativação do cadastro | `true` |
| `created_at` | `Timestamp` | `DateTime` | Data e hora de criação | `2026-06-15T15:00:00Z` |

---

### 2. Coleção: `lojas`
Armazena a listagem de filiais e unidades físicas da empresa.
* **Caminho:** `/lojas/{lojaId}`

| Campo | Tipo no Firestore | Mapeamento FlutterFlow | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | `String` | ID da loja | `"loj_centro"` |
| `nome` | `String` | `String` | Nome da Filial | `"Loja Shopping"` |

---

### 3. Coleção: `estoque`
Gerenciamento de estoque de peças e suprimentos de TI.
* **Caminho:** `/estoque/{itemId}`

| Campo | Tipo no Firestore | Mapeamento FlutterFlow | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | `String` | ID do material | `"est_ssd"` |
| `nome_material` | `String` | `String` | Nome do produto/componente | `"SSD 240GB Kingston"` |
| `quantidade_atual` | `Integer` | `Integer` | Quantidade física em estoque | `14` |
| `estoque_minimo` | `Integer` | `Integer` | Limite mínimo para alertas de compra | `5` |
| `valor_unitario` | `Double` | `Double` | Preço de custo unitário médio | `180.00` |

---

### 4. Coleção: `movimentacoes_estoque`
Registra toda entrada (reposição/cadastro) ou saída (uso em OS) de materiais.
* **Caminho:** `/movimentacoes_estoque/{movId}`

| Campo | Tipo no Firestore | Mapeamento FlutterFlow | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | `String` | ID da movimentação | `"mov_9a2b8c"` |
| `nome_material` | `String` | `String` | Nome do material movimentado | `"SSD 240GB Kingston"` |
| `quantidade` | `Integer` | `Integer` | Quantidade movimentada | `1` |
| `tipo` | `String` | `String` | Tipo de movimentação (`entrada`, `saida`) | `"saida"` |
| `data` | `Timestamp` | `DateTime` | Data e hora da operação | `2026-06-15T15:44:00Z` |
| `os_id` | `String` | `String` | ID da OS associada (vazio se for entrada manual) | `"OS-1003"` |

---

### 5. Coleção: `logs`
Armazena a trilha de auditoria e ações importantes tomadas no sistema.
* **Caminho:** `/logs/{logId}`

| Campo | Tipo no Firestore | Mapeamento FlutterFlow | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | `String` | ID único do log | `"log_a1b2c3"` |
| `acao` | `String` | `String` | Ação executada | `"Adicionou materiais usados na OS"` |
| `feito_por` | `String` | `String` (ou `Ref: users`) | UID de quem executou a ação | `"usr_tecnico"` |
| `os_id` | `String` | `String` | ID da OS relacionada (se aplicável) | `"OS-1003"` |
| `data` | `Timestamp` | `DateTime` | Data e hora do log | `2026-06-15T15:45:00Z` |

---

### 6. Coleção: `notificacoes`
Armazena alertas direcionados a usuários específicos.
* **Caminho:** `/notificacoes/{notifId}`

| Campo | Tipo no Firestore | Mapeamento FlutterFlow | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | `String` | ID único da notificação | `"not_7f8g9h"` |
| `user_id` | `String` | `String` (ou `Ref: users`) | UID do destinatário | `"usr_tecnico"` |
| `mensagem` | `String` | `String` | Conteúdo da notificação | `"Nova OS #OS-1004 foi aberta em Loja Centro"` |
| `lida` | `Boolean` | `Boolean` | Flag de visualização | `false` |
| `data` | `Timestamp` | `DateTime` | Data e hora de envio | `2026-06-15T15:52:00Z` |

---

### 7. Coleção: `os` (Ordens de Serviço)
Armazena todos os tickets de suporte criados no sistema.
* **Caminho:** `/os/{osId}`

| Campo | Tipo no Firestore | Mapeamento FlutterFlow | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | `String` | ID/Código visível da OS | `"OS-1003"` |
| `titulo` | `String` | `String` | Título do problema | `"Lentidão no desktop administrativo"` |
| `descricao` | `String` | `String` | Detalhamento do chamado | `"Computador travando ao abrir planilhas..."` |
| `equipamento` | `String` | `String` | Categoria do equipamento | `"Computador"` |
| `categoria` | `String` | `String` | Categoria de TI (computador, rede, etc) | `"Computador"` |
| `status` | `String` | `String` | Status da OS (`Aberta`, `Em andamento`, `Finalizada`, `Cancelada`) | `"Em andamento"` |
| `prioridade` | `String` | `String` | Nível de urgência (`Baixa`, `Média`, `Alta`) | `"Alta"` |
| `criado_por` | `String` | `String` (ou `Ref: users`) | UID do usuário solicitante | `"usr_usuario"` |
| `usuarios_envolvidos` | `Array (String)` | `List <String>` (ou `List <Ref: users>`) | Lista de UIDs envolvidos na OS | `["usr_tecnico"]` |
| `tecnico_responsavel` | `String` | `String` (ou `Ref: users`) | UID do técnico que atende a OS | `"usr_tecnico"` |
| `data_criacao` | `Timestamp` | `DateTime` | Data e hora de abertura | `2026-06-15T12:00:00Z` |
| `data_finalizacao` | `Timestamp` | `DateTime` | Data e hora de conclusão (ou null) | `2026-06-15T18:00:00Z` |
| `loja_unidade` | `String` | `String` | Nome da loja do chamado | `"Loja Shopping"` |
| `material_aprovado` | `Boolean` | `Boolean` | Flag de histórico (padrão `true` no fluxo direto) | `true` |
| `motivo_rejeicao` | `String` | `String` | Justificativa de cancelamento/rejeição (se houver) | `""` |
| `relatorio_url` | `String` | `String` | URL do documento PDF assinado | `""` |
| `custo_total_materiais` | `Double` | `Double` | Custo somado de materiais usados | `400.00` |
| `materiais` | `Array (Map)` | `List <DataType: Material>` | Lista de materiais gastos (detalhado abaixo) | `[ { nome: ..., qtd: ... } ]` |

#### Estrutura do DataType `Material` (inserido no array `materiais` acima):
Em vez de uma subcoleção complexa, recomenda-se usar um tipo de dados estruturado (DataType / Map) dentro de uma lista na própria OS para simplificar buscas e relatórios:
* `nome_material` (`String`)
* `quantidade` (`Integer`)
* `valor_unitario` (`Double`)
* `valor_total` (`Double`)

---

### 8. Subcoleção: `os/{osId}/mensagens`
Histórico de mensagens trocadas no chat interno do chamado.
* **Caminho:** `/os/{osId}/mensagens/{msgId}`

| Campo | Tipo no Firestore | Mapeamento FlutterFlow | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `mensagem_texto` | `String` | `String` | Mensagem enviada | `"Troquei o SSD e a máquina já está ok."` |
| `midia_url` | `String` | `String` | URL do anexo no Storage (opcional) | `"https://storage.googleapis.com/...image.png"` |
| `tipo_midia` | `String` | `String` | Tipo do anexo (`foto`, `video`, `nenhum`) | `"foto"` |
| `enviado_por` | `String` | `String` (ou `Ref: users`) | UID do remetente | `"usr_tecnico"` |
| `data_envio` | `Timestamp` | `DateTime` | Data e hora do envio | `2026-06-15T15:45:00Z` |

---

### 9. Índices Recomendados no Firestore
Para melhor performance e evitar erros de query no FlutterFlow, crie os seguintes índices compostos:

1. **Coleção `os`**:
   - `criado_por` (Ascending) + `data_criacao` (Descending)
   - `status` (Ascending) + `data_criacao` (Descending)
   - `tecnico_responsavel` (Ascending) + `status` (Ascending) + `data_criacao` (Descending)
2. **Coleção `movimentacoes_estoque`**:
   - `nome_material` (Ascending) + `data` (Descending)
3. **Coleção `logs`**:
   - `os_id` (Ascending) + `data` (Descending)
