import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

dotenv.config();

export async function initializeMCP() {
  try {
    const transport = new StdioClientTransport({
      command: "node",
      args: [
        "--experimental-strip-types",
        "--no-warnings=ExperimentalWarning",
        process.env.ALGOLIA_MCP_NODE_PATH,
      ],
      env: {
        ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
        ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
        ALGOLIA_INDEX_NAME:
          process.env.ALGOLIA_INDEX_NAME || "algolia_movie_sample_dataset",
        MCP_ENABLED_TOOLS: "search,analytics",
      },
    });

    mcpClient = new Client(
      {
        name: "algolia-chat-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await mcpClient.connect(transport);
    console.log("MCP client connected successfully");

    // List available tools
    const tools = await mcpClient.listTools();
  } catch (error) {
    console.error("Failed to initialize MCP client:", error);
    throw error;
  }
}

// MCP Client setup
let mcpClient = null;

// Function to call MCP tools
export async function callMCPTool(toolName, args = {}) {
  if (!mcpClient) {
    throw new Error("MCP client not initialized");
  }

  try {
    const result = await mcpClient.callTool({
      name: toolName,
      arguments: args,
    });
    return result;
  } catch (error) {
    console.error(`Error calling MCP tool ${toolName}:`, error);
    throw error;
  }
}

// Function to determine which Algolia tools to use based on user intent
export function analyzeIntent(message) {
  const intent = {
    needsSearch: false,
    needsAnalytics: false,
    needsIndexInfo: false,
    needsUserInfo: false,
    tools: [],
  };

  const lowerMessage = message.toLowerCase();

  // Search related intents
  if (
    lowerMessage.includes("search") ||
    lowerMessage.includes("find") ||
    lowerMessage.includes("look for") ||
    lowerMessage.includes("query")
  ) {
    intent.needsSearch = true;
    intent.tools.push("searchSingleIndex");
  }

  // Analytics related intents
  if (
    lowerMessage.includes("analytics") ||
    lowerMessage.includes("stats") ||
    lowerMessage.includes("metrics") ||
    lowerMessage.includes("performance")
  ) {
    intent.needsAnalytics = true;
    intent.tools.push("getTopSearches", "getNoResultsRate", "getTopHits");
  }

  // Index information intents
  if (
    lowerMessage.includes("index") ||
    lowerMessage.includes("indices") ||
    lowerMessage.includes("settings")
  ) {
    intent.needsIndexInfo = true;
    intent.tools.push("listIndices", "getSettings");
  }

  // User/Application info intents
  if (
    lowerMessage.includes("user") ||
    lowerMessage.includes("account") ||
    lowerMessage.includes("application")
  ) {
    intent.needsUserInfo = true;
    intent.tools.push("getUserInfo", "getApplications");
  }

  return intent;
}

// Get MCP client instance
export function getMCPClient() {
  if (!mcpClient) {
    throw new Error("MCP client not initialized");
  }
  return mcpClient;
}
