import express from "express";
import cors from "cors";
import { initializeMCP, getMCPClient } from "./mcp.js";
import ai from "./ai.js";

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

// Middleware
// allowed all origins -- not for production

app.use(cors());
app.use(express.json());

// Main chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const { aiResponse, mcpResults, intent } = await ai(
      message,
      conversationHistory
    );
    console.log("Response Generated in backend:", aiResponse, "\n");
    console.log("mcp:", mcpResults, "\n");
    console.log("intent:", intent, "\n");
    res.json({
      response: aiResponse,
      mcpResults: mcpResults, // Include raw MCP data for debugging
      intent: intent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const mcpClient = getMCPClient();
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        groq: process.env.GROQ_API_KEY ? "configured" : "not configured",
        algolia: process.env.ALGOLIA_API_KEY ? "configured" : "not configured",
        mcp: mcpClient ? "connected" : "not connected",
      },
    };

    // Test MCP connection
    if (mcpClient) {
      try {
        await mcpClient.listTools();
        health.services.mcp = "connected";
      } catch (error) {
        health.services.mcp = "error";
        health.mcpError = error.message;
      }
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
});

// Get available MCP tools
app.get("/api/tools", async (req, res) => {
  try {
    const mcpClient = getMCPClient();
    if (!mcpClient) {
      return res.status(500).json({ error: "MCP client not initialized" });
    }

    const tools = await mcpClient.listTools();
    res.json({
      tools: tools.tools,
      count: tools.tools.length,
    });
  } catch (error) {
    console.error("Tools endpoint error:", error);
    res.status(500).json({
      error: "Failed to get tools",
      details: error.message,
    });
  }
});

// Start server
async function startServer() {
  try {
    // Initialize MCP client first
    await initializeMCP();

    app.listen(PORT, HOST, () => {
      console.log(`Server running on  http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  const mcpClient = getMCPClient();

  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  const mcpClient = getMCPClient();

  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});

startServer();
