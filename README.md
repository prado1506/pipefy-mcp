# Pipefy MCP Server

Um servidor MCP (Model Context Protocol) para integração com o Pipefy, permitindo que assistentes de IA interajam com a plataforma Pipefy de forma natural.

## Funcionalidades

Este servidor MCP fornece ferramentas para:

- **Gerenciamento de Organizações**
  - Listar organizações acessíveis

- **Gerenciamento de Pipes**
  - Listar todos os pipes
  - Obter detalhes de um pipe específico (incluindo fases e campos)

- **Gerenciamento de Cards**
  - Listar cards de um pipe
  - Buscar cards com filtros
  - Obter detalhes completos de um card
  - Criar novos cards
  - Atualizar cards existentes
  - Mover cards entre fases
  - Deletar cards

- **Gerenciamento de Databases (Tabelas)**
  - Listar databases de uma organização
  - Obter detalhes de um database (incluindo campos)
  - Listar records de um database
  - Obter detalhes completos de um record
  - Criar novos records
  - Atualizar records existentes
  - Deletar records

## Pré-requisitos

- Node.js 18 ou superior
- Token de API do Pipefy ([Como obter seu token](https://help.pipefy.com/en/articles/3504104-how-to-find-your-api-token))

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd pipefy-mcp
```

2. Instale as dependências:
```bash
npm install
```

3. Compile o projeto:
```bash
npm run build
```

## Configuração

### Obter Token de API do Pipefy

1. Faça login no [Pipefy](https://app.pipefy.com)
2. Clique no seu avatar no canto superior direito
3. Selecione "Configurações"
4. Vá para "Tokens de Acesso Pessoal"
5. Clique em "Gerar novo token"
6. Copie o token gerado

### Configurar no Claude Desktop

Edite o arquivo de configuração do Claude Desktop:

**No macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**No Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Adicione a seguinte configuração:

```json
{
  "mcpServers": {
    "pipefy": {
      "command": "node",
      "args": ["/caminho/absoluto/para/pipefy-mcp/build/index.js"],
      "env": {
        "PIPEFY_API_TOKEN": "seu-token-aqui"
      }
    }
  }
}
```

Substitua:
- `/caminho/absoluto/para/pipefy-mcp` pelo caminho completo onde você clonou o repositório
- `seu-token-aqui` pelo seu token de API do Pipefy

## Uso

Após configurar, reinicie o Claude Desktop. Você poderá usar comandos naturais como:

### Exemplos de Uso

**Listar organizações:**
```
Quais organizações do Pipefy eu tenho acesso?
```

**Listar pipes:**
```
Liste todos os meus pipes do Pipefy
```

**Ver detalhes de um pipe:**
```
Mostre os detalhes do pipe [ID_DO_PIPE]
```

**Listar cards:**
```
Liste os cards do pipe [ID_DO_PIPE]
```

**Buscar cards:**
```
Busque cards no pipe [ID_DO_PIPE] com o termo "urgente"
```

**Criar um card:**
```
Crie um card no pipe [ID_DO_PIPE] na fase [ID_DA_FASE] com o título "Nova Tarefa"
```

**Atualizar um card:**
```
Atualize o card [ID_DO_CARD] com o título "Tarefa Atualizada"
```

**Mover um card:**
```
Mova o card [ID_DO_CARD] para a fase [ID_DA_FASE]
```

**Deletar um card:**
```
Delete o card [ID_DO_CARD]
```

**Listar databases:**
```
Liste os databases da organização [ID_DA_ORGANIZACAO]
```

**Ver detalhes de um database:**
```
Mostre os detalhes do database [ID_DO_DATABASE]
```

**Listar records de um database:**
```
Liste os records do database [ID_DO_DATABASE]
```

**Criar um record:**
```
Crie um record no database [ID_DO_DATABASE] com o título "Novo Cliente"
```

**Atualizar um record:**
```
Atualize o record [ID_DO_RECORD] com o título "Cliente Atualizado"
```

**Deletar um record:**
```
Delete o record [ID_DO_RECORD]
```

## Ferramentas Disponíveis

### list_organizations
Lista todas as organizações acessíveis com o token de API.

### list_pipes
Lista todos os pipes de uma organização ou do usuário.

**Parâmetros:**
- `organization_id` (opcional): ID da organização

### get_pipe
Obtém informações detalhadas sobre um pipe específico.

**Parâmetros:**
- `pipe_id` (obrigatório): ID do pipe

### list_cards
Lista cards de um pipe específico.

**Parâmetros:**
- `pipe_id` (obrigatório): ID do pipe
- `first` (opcional): Número de cards a retornar (padrão: 50, máximo: 50)
- `search` (opcional): Termo de busca para filtrar cards

### search_cards
Busca cards em um pipe usando critérios específicos.

**Parâmetros:**
- `pipe_id` (obrigatório): ID do pipe
- `search` (obrigatório): Termo de busca

### get_card
Obtém informações detalhadas sobre um card específico.

**Parâmetros:**
- `card_id` (obrigatório): ID do card

### create_card
Cria um novo card em um pipe.

**Parâmetros:**
- `pipe_id` (obrigatório): ID do pipe
- `phase_id` (obrigatório): ID da fase
- `title` (obrigatório): Título do card
- `fields_attributes` (opcional): Array de valores de campos
- `assignee_ids` (opcional): Array de IDs de usuários para atribuir

### update_card
Atualiza um card existente.

**Parâmetros:**
- `card_id` (obrigatório): ID do card
- `title` (opcional): Novo título
- `due_date` (opcional): Data de vencimento (formato: YYYY-MM-DD)
- `assignee_ids` (opcional): Array de IDs de usuários

### move_card
Move um card para uma fase diferente.

**Parâmetros:**
- `card_id` (obrigatório): ID do card
- `destination_phase_id` (obrigatório): ID da fase de destino

### delete_card
Deleta um card do pipe.

**Parâmetros:**
- `card_id` (obrigatório): ID do card

### list_tables
Lista todos os databases (tabelas) de uma organização.

**Parâmetros:**
- `organization_id` (obrigatório): ID da organização

### get_table
Obtém informações detalhadas sobre um database específico, incluindo seus campos.

**Parâmetros:**
- `table_id` (obrigatório): ID do database

### list_table_records
Lista records de um database com filtragem opcional.

**Parâmetros:**
- `table_id` (obrigatório): ID do database
- `first` (opcional): Número de records a retornar (padrão: 50, máximo: 50)
- `search` (opcional): Termo de busca para filtrar records

### get_table_record
Obtém informações detalhadas sobre um record específico de um database.

**Parâmetros:**
- `record_id` (obrigatório): ID do record

### create_table_record
Cria um novo record em um database.

**Parâmetros:**
- `table_id` (obrigatório): ID do database
- `title` (obrigatório): Título do record
- `fields_attributes` (opcional): Array de valores de campos
  - `field_id` (obrigatório): ID do campo
  - `field_value` (obrigatório): Valor do campo

### update_table_record
Atualiza um record existente em um database.

**Parâmetros:**
- `record_id` (obrigatório): ID do record
- `title` (opcional): Novo título
- `fields_attributes` (opcional): Array de valores de campos a atualizar
  - `field_id` (obrigatório): ID do campo
  - `field_value` (obrigatório): Valor do campo

### delete_table_record
Deleta um record de um database.

**Parâmetros:**
- `record_id` (obrigatório): ID do record

## Desenvolvimento

### Scripts Disponíveis

- `npm run build` - Compila o TypeScript para JavaScript
- `npm run watch` - Compila em modo watch
- `npm run dev` - Compila e executa o servidor

### Estrutura do Projeto

```
pipefy-mcp/
├── src/
│   └── index.ts       # Código principal do servidor MCP
├── build/             # Código compilado (gerado)
├── package.json       # Dependências e scripts
├── tsconfig.json      # Configuração do TypeScript
└── README.md          # Documentação
```

## Segurança

- Nunca compartilhe seu token de API do Pipefy
- O token deve ser armazenado apenas na configuração local do Claude Desktop
- O token não deve ser commitado no repositório

## Recursos Adicionais

- [Documentação da API do Pipefy](https://developers.pipefy.com/)
- [Documentação do Model Context Protocol](https://modelcontextprotocol.io/)
- [Especificação MCP](https://spec.modelcontextprotocol.io/)

## Solução de Problemas

### O servidor não inicia
- Verifique se o token de API está configurado corretamente
- Verifique se o caminho para o arquivo `build/index.js` está correto
- Execute `npm run build` para garantir que o código está compilado

### Erros de autenticação
- Verifique se o token de API é válido
- Gere um novo token no Pipefy se necessário

### Cards não aparecem
- Verifique se você tem permissão de acesso ao pipe
- Verifique se o ID do pipe está correto

## Licença

MIT

## Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.
