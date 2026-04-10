#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

interface PipefyConfig {
  apiToken: string;
  baseUrl?: string;
}

class PipefyMCPServer {
  private server: Server;
  private axiosInstance: AxiosInstance;
  private apiToken: string;

  constructor(config: PipefyConfig) {
    this.apiToken = config.apiToken;
    this.server = new Server(
      {
        name: "pipefy-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || "https://api.pipefy.com/graphql",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async executePipefyQuery(query: string, variables?: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post("", {
        query,
        variables,
      });

      if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors));
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Pipefy API Error: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "list_pipes":
            return await this.listPipes(args);
          case "get_pipe":
            return await this.getPipe(args);
          case "list_cards":
            return await this.listCards(args);
          case "get_card":
            return await this.getCard(args);
          case "create_card":
            return await this.createCard(args);
          case "update_card":
            return await this.updateCard(args);
          case "move_card":
            return await this.moveCard(args);
          case "delete_card":
            return await this.deleteCard(args);
          case "list_organizations":
            return await this.listOrganizations(args);
          case "search_cards":
            return await this.searchCards(args);
          case "list_tables":
            return await this.listTables(args);
          case "get_table":
            return await this.getTable(args);
          case "list_table_records":
            return await this.listTableRecords(args);
          case "get_table_record":
            return await this.getTableRecord(args);
          case "create_table_record":
            return await this.createTableRecord(args);
          case "update_table_record":
            return await this.updateTableRecord(args);
          case "delete_table_record":
            return await this.deleteTableRecord(args);
          case "create_card_comment":
            return await this.createCardComment(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: "list_organizations",
        description: "List all organizations accessible with the API token",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_pipes",
        description: "List all pipes from an organization or get pipes accessible by the user",
        inputSchema: {
          type: "object",
          properties: {
            organization_id: {
              type: "string",
              description: "Organization ID (optional - if not provided, lists pipes from all organizations)",
            },
          },
        },
      },
      {
        name: "get_pipe",
        description: "Get detailed information about a specific pipe including phases and fields",
        inputSchema: {
          type: "object",
          properties: {
            pipe_id: {
              type: "string",
              description: "The ID of the pipe",
            },
          },
          required: ["pipe_id"],
        },
      },
      {
        name: "list_cards",
        description: "List cards from a specific pipe with optional filtering",
        inputSchema: {
          type: "object",
          properties: {
            pipe_id: {
              type: "string",
              description: "The ID of the pipe",
            },
            first: {
              type: "number",
              description: "Number of cards to return (default: 50, max: 50)",
            },
            search: {
              type: "string",
              description: "Search term to filter cards",
            },
          },
          required: ["pipe_id"],
        },
      },
      {
        name: "search_cards",
        description: "Search for cards across pipes using various criteria",
        inputSchema: {
          type: "object",
          properties: {
            pipe_id: {
              type: "string",
              description: "The ID of the pipe to search in",
            },
            search: {
              type: "string",
              description: "Search term",
            },
          },
          required: ["pipe_id", "search"],
        },
      },
      {
        name: "get_card",
        description: "Get detailed information about a specific card",
        inputSchema: {
          type: "object",
          properties: {
            card_id: {
              type: "string",
              description: "The ID of the card",
            },
          },
          required: ["card_id"],
        },
      },
      {
        name: "create_card",
        description: "Create a new card in a pipe",
        inputSchema: {
          type: "object",
          properties: {
            pipe_id: {
              type: "string",
              description: "The ID of the pipe",
            },
            phase_id: {
              type: "string",
              description: "The ID of the phase where the card will be created",
            },
            title: {
              type: "string",
              description: "The title of the card",
            },
            fields_attributes: {
              type: "array",
              description: "Array of field values for the card",
              items: {
                type: "object",
                properties: {
                  field_id: {
                    type: "string",
                    description: "The ID of the field",
                  },
                  field_value: {
                    type: "string",
                    description: "The value for the field",
                  },
                },
              },
            },
            assignee_ids: {
              type: "array",
              description: "Array of user IDs to assign to the card",
              items: {
                type: "string",
              },
            },
          },
          required: ["pipe_id", "phase_id", "title"],
        },
      },
      {
        name: "update_card",
        description: "Update an existing card",
        inputSchema: {
          type: "object",
          properties: {
            card_id: {
              type: "string",
              description: "The ID of the card to update",
            },
            title: {
              type: "string",
              description: "New title for the card",
            },
            due_date: {
              type: "string",
              description: "Due date in ISO format (YYYY-MM-DD)",
            },
            assignee_ids: {
              type: "array",
              description: "Array of user IDs to assign to the card",
              items: {
                type: "string",
              },
            },
          },
          required: ["card_id"],
        },
      },
      {
        name: "move_card",
        description: "Move a card to a different phase",
        inputSchema: {
          type: "object",
          properties: {
            card_id: {
              type: "string",
              description: "The ID of the card to move",
            },
            destination_phase_id: {
              type: "string",
              description: "The ID of the destination phase",
            },
          },
          required: ["card_id", "destination_phase_id"],
        },
      },
      {
        name: "delete_card",
        description: "Delete a card from a pipe",
        inputSchema: {
          type: "object",
          properties: {
            card_id: {
              type: "string",
              description: "The ID of the card to delete",
            },
          },
          required: ["card_id"],
        },
      },
      {
        name: "list_tables",
        description: "List all database tables from an organization",
        inputSchema: {
          type: "object",
          properties: {
            organization_id: {
              type: "string",
              description: "The ID of the organization",
            },
          },
          required: ["organization_id"],
        },
      },
      {
        name: "get_table",
        description: "Get detailed information about a specific database table including fields",
        inputSchema: {
          type: "object",
          properties: {
            table_id: {
              type: "string",
              description: "The ID of the table",
            },
          },
          required: ["table_id"],
        },
      },
      {
        name: "list_table_records",
        description: "List records from a database table with optional filtering",
        inputSchema: {
          type: "object",
          properties: {
            table_id: {
              type: "string",
              description: "The ID of the table",
            },
            first: {
              type: "number",
              description: "Number of records to return (default: 50, max: 50)",
            },
            search: {
              type: "string",
              description: "Search term to filter records",
            },
          },
          required: ["table_id"],
        },
      },
      {
        name: "get_table_record",
        description: "Get detailed information about a specific table record",
        inputSchema: {
          type: "object",
          properties: {
            record_id: {
              type: "string",
              description: "The ID of the table record",
            },
          },
          required: ["record_id"],
        },
      },
      {
        name: "create_table_record",
        description: "Create a new record in a database table",
        inputSchema: {
          type: "object",
          properties: {
            table_id: {
              type: "string",
              description: "The ID of the table",
            },
            title: {
              type: "string",
              description: "The title of the record",
            },
            fields_attributes: {
              type: "array",
              description: "Array of field values for the record",
              items: {
                type: "object",
                properties: {
                  field_id: {
                    type: "string",
                    description: "The ID of the field",
                  },
                  field_value: {
                    type: "string",
                    description: "The value for the field",
                  },
                },
              },
            },
          },
          required: ["table_id", "title"],
        },
      },
      {
        name: "update_table_record",
        description: "Update an existing table record",
        inputSchema: {
          type: "object",
          properties: {
            record_id: {
              type: "string",
              description: "The ID of the record to update",
            },
            title: {
              type: "string",
              description: "New title for the record",
            },
            fields_attributes: {
              type: "array",
              description: "Array of field values to update",
              items: {
                type: "object",
                properties: {
                  field_id: {
                    type: "string",
                    description: "The ID of the field",
                  },
                  field_value: {
                    type: "string",
                    description: "The value for the field",
                  },
                },
              },
            },
          },
          required: ["record_id"],
        },
      },
      {
        name: "delete_table_record",
        description: "Delete a record from a database table",
        inputSchema: {
          type: "object",
          properties: {
            record_id: {
              type: "string",
              description: "The ID of the record to delete",
            },
          },
          required: ["record_id"],
        },
      },
      {
        name: "create_card_comment",
        description: "Add a comment to a Pipefy card",
        inputSchema: {
          type: "object",
          properties: {
            card_id: {
              type: "string",
              description: "The ID of the card to comment on",
            },
            text: {
              type: "string",
              description: "The comment text (supports markdown)",
            },
          },
          required: ["card_id", "text"],
        },
      },
    ];
  }

  private async listOrganizations(args: any) {
    const query = `
      query {
        me {
          organizations {
            id
            name
          }
        }
      }
    `;

    const data = await this.executePipefyQuery(query);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.me.organizations, null, 2),
        },
      ],
    };
  }

  private async listPipes(args: any) {
    const { organization_id } = args;

    let query: string;
    let variables = {};

    if (organization_id) {
      query = `
        query($orgId: ID!) {
          organization(id: $orgId) {
            pipes {
              id
              name
              description
            }
          }
        }
      `;
      variables = { orgId: organization_id };
    } else {
      query = `
        query {
          me {
            pipes {
              id
              name
              description
            }
          }
        }
      `;
    }

    const data = await this.executePipefyQuery(query, variables);
    const pipes = organization_id ? data.organization.pipes : data.me.pipes;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(pipes, null, 2),
        },
      ],
    };
  }

  private async getPipe(args: any) {
    const { pipe_id } = args;

    const query = `
      query($pipeId: ID!) {
        pipe(id: $pipeId) {
          id
          name
          description
          start_form_fields {
            id
            label
            type
            required
            options
          }
          phases {
            id
            name
            description
            fields {
              id
              label
              type
              required
              options
            }
          }
        }
      }
    `;

    const data = await this.executePipefyQuery(query, { pipeId: pipe_id });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.pipe, null, 2),
        },
      ],
    };
  }

  private async listCards(args: any) {
    const { pipe_id, first = 50, search } = args;

    const query = `
      query($pipeId: ID!, $first: Int, $search: String) {
        pipe(id: $pipeId) {
          cards(first: $first, search: $search) {
            edges {
              node {
                id
                title
                current_phase {
                  id
                  name
                }
                assignees {
                  id
                  name
                }
                due_date
                created_at
                updated_at
              }
            }
          }
        }
      }
    `;

    const variables: any = {
      pipeId: pipe_id,
      first: Math.min(first, 50),
    };

    if (search) {
      variables.search = search;
    }

    const data = await this.executePipefyQuery(query, variables);
    const cards = data.pipe.cards.edges.map((edge: any) => edge.node);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(cards, null, 2),
        },
      ],
    };
  }

  private async searchCards(args: any) {
    const { pipe_id, search } = args;

    const query = `
      query($pipeId: ID!, $search: String!) {
        pipe(id: $pipeId) {
          cards(search: $search, first: 50) {
            edges {
              node {
                id
                title
                current_phase {
                  id
                  name
                }
                fields {
                  name
                  value
                }
                assignees {
                  id
                  name
                  email
                }
                due_date
                created_at
                updated_at
              }
            }
          }
        }
      }
    `;

    const data = await this.executePipefyQuery(query, {
      pipeId: pipe_id,
      search,
    });
    const cards = data.pipe.cards.edges.map((edge: any) => edge.node);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(cards, null, 2),
        },
      ],
    };
  }

  private async getCard(args: any) {
    const { card_id } = args;

    const query = `
      query($cardId: ID!) {
        card(id: $cardId) {
          id
          title
          current_phase {
            id
            name
          }
          fields {
            name
            value
            field {
              id
            }
          }
          assignees {
            id
            name
            email
          }
          comments {
            id
            text
            author {
              name
            }
            created_at
          }
          due_date
          created_at
          updated_at
          url
        }
      }
    `;

    const data = await this.executePipefyQuery(query, { cardId: card_id });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.card, null, 2),
        },
      ],
    };
  }

  private async createCard(args: any) {
    const { pipe_id, phase_id, title, fields_attributes, assignee_ids } = args;

    const mutation = `
      mutation($input: CreateCardInput!) {
        createCard(input: $input) {
          card {
            id
            title
            current_phase {
              id
              name
            }
          }
        }
      }
    `;

    const input: any = {
      pipe_id,
      phase_id,
      title,
    };

    if (fields_attributes && fields_attributes.length > 0) {
      input.fields_attributes = fields_attributes;
    }

    if (assignee_ids && assignee_ids.length > 0) {
      input.assignee_ids = assignee_ids;
    }

    const data = await this.executePipefyQuery(mutation, { input });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.createCard.card, null, 2),
        },
      ],
    };
  }

  private async updateCard(args: any) {
    const { card_id, title, due_date, assignee_ids } = args;

    const mutation = `
      mutation($input: UpdateCardInput!) {
        updateCard(input: $input) {
          card {
            id
            title
            due_date
            assignees {
              id
              name
            }
          }
        }
      }
    `;

    const input: any = {
      id: card_id,
    };

    if (title) input.title = title;
    if (due_date) input.due_date = due_date;
    if (assignee_ids) input.assignee_ids = assignee_ids;

    const data = await this.executePipefyQuery(mutation, { input });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.updateCard.card, null, 2),
        },
      ],
    };
  }

  private async moveCard(args: any) {
    const { card_id, destination_phase_id } = args;

    const mutation = `
      mutation($input: MoveCardToPhaseInput!) {
        moveCardToPhase(input: $input) {
          card {
            id
            title
            current_phase {
              id
              name
            }
          }
        }
      }
    `;

    const data = await this.executePipefyQuery(mutation, {
      input: {
        card_id,
        destination_phase_id,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.moveCardToPhase.card, null, 2),
        },
      ],
    };
  }

  private async deleteCard(args: any) {
    const { card_id } = args;

    const mutation = `
      mutation($input: DeleteCardInput!) {
        deleteCard(input: $input) {
          success
        }
      }
    `;

    const data = await this.executePipefyQuery(mutation, {
      input: { id: card_id },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: data.deleteCard.success,
            message: "Card deleted successfully",
          }, null, 2),
        },
      ],
    };
  }

  private async listTables(args: any) {
    const { organization_id } = args;

    const query = `
      query($orgId: ID!) {
        organization(id: $orgId) {
          tables {
            id
            name
            description
            public
            authorization
            table_fields {
              id
              label
              type
              required
            }
          }
        }
      }
    `;

    const data = await this.executePipefyQuery(query, { orgId: organization_id });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.organization.tables, null, 2),
        },
      ],
    };
  }

  private async getTable(args: any) {
    const { table_id } = args;

    const query = `
      query($tableId: ID!) {
        table(id: $tableId) {
          id
          name
          description
          public
          authorization
          table_fields {
            id
            label
            type
            description
            required
            options
            minimal_view
          }
        }
      }
    `;

    const data = await this.executePipefyQuery(query, { tableId: table_id });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.table, null, 2),
        },
      ],
    };
  }

  private async listTableRecords(args: any) {
    const { table_id, first = 50, search } = args;

    const query = `
      query($tableId: ID!, $first: Int, $search: String) {
        table(id: $tableId) {
          table_records(first: $first, search: $search) {
            edges {
              node {
                id
                title
                record_fields {
                  name
                  value
                  field {
                    id
                    type
                  }
                }
                created_at
                updated_at
              }
            }
          }
        }
      }
    `;

    const variables: any = {
      tableId: table_id,
      first: Math.min(first, 50),
    };

    if (search) {
      variables.search = search;
    }

    const data = await this.executePipefyQuery(query, variables);
    const records = data.table.table_records.edges.map((edge: any) => edge.node);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(records, null, 2),
        },
      ],
    };
  }

  private async getTableRecord(args: any) {
    const { record_id } = args;

    const query = `
      query($recordId: ID!) {
        table_record(id: $recordId) {
          id
          title
          record_fields {
            name
            value
            filled_at
            updated_at
            field {
              id
              label
              type
              description
            }
          }
          created_at
          updated_at
        }
      }
    `;

    const data = await this.executePipefyQuery(query, { recordId: record_id });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.table_record, null, 2),
        },
      ],
    };
  }

  private async createTableRecord(args: any) {
    const { table_id, title, fields_attributes } = args;

    const mutation = `
      mutation($input: CreateTableRecordInput!) {
        createTableRecord(input: $input) {
          table_record {
            id
            title
            record_fields {
              name
              value
              field {
                id
                label
              }
            }
          }
        }
      }
    `;

    const input: any = {
      table_id,
      title,
    };

    if (fields_attributes && fields_attributes.length > 0) {
      input.fields_attributes = fields_attributes;
    }

    const data = await this.executePipefyQuery(mutation, { input });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.createTableRecord.table_record, null, 2),
        },
      ],
    };
  }

  private async updateTableRecord(args: any) {
    const { record_id, title, fields_attributes } = args;

    const mutation = `
      mutation($input: UpdateTableRecordInput!) {
        updateTableRecord(input: $input) {
          table_record {
            id
            title
            record_fields {
              name
              value
              field {
                id
                label
              }
            }
          }
        }
      }
    `;

    const input: any = {
      id: record_id,
    };

    if (title) input.title = title;
    if (fields_attributes && fields_attributes.length > 0) {
      input.fields_attributes = fields_attributes;
    }

    const data = await this.executePipefyQuery(mutation, { input });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.updateTableRecord.table_record, null, 2),
        },
      ],
    };
  }

  private async deleteTableRecord(args: any) {
    const { record_id } = args;

    const mutation = `
      mutation($input: DeleteTableRecordInput!) {
        deleteTableRecord(input: $input) {
          success
        }
      }
    `;

    const data = await this.executePipefyQuery(mutation, {
      input: { id: record_id },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: data.deleteTableRecord.success,
            message: "Table record deleted successfully",
          }, null, 2),
        },
      ],
    };
  }

  private async createCardComment(args: any) {
    const { card_id, text } = args;

    const mutation = `
      mutation($input: CreateCommentInput!) {
        createComment(input: $input) {
          comment {
            id
            text
            author {
              name
            }
            created_at
          }
        }
      }
    `;

    const data = await this.executePipefyQuery(mutation, {
      input: { card_id, text },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.createComment.comment, null, 2),
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Pipefy MCP Server running on stdio");
  }
}

const apiToken = process.env.PIPEFY_API_TOKEN;

if (!apiToken) {
  console.error("Error: PIPEFY_API_TOKEN environment variable is required");
  process.exit(1);
}

const server = new PipefyMCPServer({
  apiToken,
});

server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
