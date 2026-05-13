/**
 * PetalPress sample MSSQL MCP server.
 *
 * Tools:
 *   - get_top_active_employees(limit)   — fetch active employees ordered by employee ID
 *   - get_top_salary_staff(limit)       — fetch highest-paid staff ordered by salary descending
 *
 * Data source: Microsoft SQL Server via the `mssql` driver.
 * Configure access with MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USER, MSSQL_PASSWORD,
 * and optional MSSQL_PORT, MSSQL_ENCRYPT, MSSQL_TRUST_SERVER_CERTIFICATE.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import sql from "mssql";
import { z } from "zod";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const positiveLimitSchema = z.object({
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

interface EmployeeRow {
  employee_id: number | string;
  employee_name?: string;
  department?: string;
  status?: string;
  salary?: number;
  currency?: string;
}

function parseBooleanEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (value == null || value === "") return fallback;
  return value === "1" || value === "true" || value === "yes";
}

function getSqlConfig(): sql.config {
  const server = process.env.MSSQL_SERVER?.trim();
  const database = process.env.MSSQL_DATABASE?.trim();
  const user = process.env.MSSQL_USER?.trim();
  const password = process.env.MSSQL_PASSWORD;
  const port = process.env.MSSQL_PORT ? Number(process.env.MSSQL_PORT) : 1433;

  if (!server || !database || !user || !password) {
    throw new Error(
      "Missing MSSQL configuration. Set MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USER, and MSSQL_PASSWORD.",
    );
  }

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("MSSQL_PORT must be a positive integer if provided.");
  }

  return {
    server,
    database,
    user,
    password,
    port,
    options: {
      encrypt: parseBooleanEnv("MSSQL_ENCRYPT", true),
      trustServerCertificate: parseBooleanEnv(
        "MSSQL_TRUST_SERVER_CERTIFICATE",
        false,
      ),
    },
  };
}

function normalizeLimit(rawArgs: unknown): number {
  const parsed = positiveLimitSchema.safeParse({
    limit:
      typeof (rawArgs as { limit?: unknown } | undefined)?.limit === "number"
        ? (rawArgs as { limit?: number }).limit
        : typeof (rawArgs as { limit?: unknown } | undefined)?.limit ===
            "string"
          ? Number((rawArgs as { limit?: string }).limit)
          : undefined,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid limit: ${parsed.error.issues[0]?.message ?? "unknown error"}`,
    );
  }

  return parsed.data.limit ?? DEFAULT_LIMIT;
}

async function runEmployeeQuery(
  queryText: string,
  limit: number,
): Promise<EmployeeRow[]> {
  const pool = await sql.connect(getSqlConfig());

  try {
    const result = await pool
      .request()
      .input("limit", sql.Int, limit)
      .query<EmployeeRow>(queryText);
    return result.recordset;
  } finally {
    await pool.close();
  }
}

async function getTopActiveEmployees(limit: number): Promise<EmployeeRow[]> {
  return runEmployeeQuery(
    `
      SELECT TOP (@limit)
        employee_id,
        employee_name,
        department,
        status,
        salary,
        currency
      FROM Employees
      WHERE status = 'active'
      ORDER BY employee_id ASC;
    `,
    limit,
  );
}

async function getTopSalaryStaff(limit: number): Promise<EmployeeRow[]> {
  return runEmployeeQuery(
    `
      SELECT TOP (@limit)
        employee_id,
        employee_name,
        department,
        status,
        salary,
        currency
      FROM Employees
      ORDER BY salary DESC, employee_id ASC;
    `,
    limit,
  );
}

const server = new Server(
  { name: "petalpress-mssql", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_top_active_employees",
      description:
        "Use this when you need a quick employee roster from Microsoft SQL Server. Returns the top active employees from the Employees table, filtered to status = 'active' and ordered by employee_id ascending. Best for dashboard samples, admin lookups, and validating that the MCP can read employee records.",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "integer",
            minimum: 1,
            maximum: MAX_LIMIT,
            description: `Maximum number of rows to return. Defaults to ${DEFAULT_LIMIT}.`,
          },
        },
      },
    },
    {
      name: "get_top_salary_staff",
      description:
        "Use this when you need compensation-oriented ranking data from Microsoft SQL Server. Returns the highest-paid staff from the Employees table ordered by salary descending, with employee details included. Best for analytics demos, HR reporting samples, and verifying salary sorting logic.",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "integer",
            minimum: 1,
            maximum: MAX_LIMIT,
            description: `Maximum number of rows to return. Defaults to ${DEFAULT_LIMIT}.`,
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const limit = normalizeLimit(args);

    if (name === "get_top_active_employees") {
      const employees = await getTopActiveEmployees(limit);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              tool: name,
              table: "Employees",
              filter: "status = 'active'",
              sort: "employee_id ASC",
              limit,
              rows: employees,
            }),
          },
        ],
      };
    }

    if (name === "get_top_salary_staff") {
      const employees = await getTopSalaryStaff(limit);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              tool: name,
              table: "Employees",
              sort: "salary DESC, employee_id ASC",
              limit,
              rows: employees,
            }),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [{ type: "text", text: JSON.stringify({ error: message }) }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
