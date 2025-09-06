import { analyzeIntent, callMCPTool } from "./mcp.js";
import { systemPrompt } from "./prompt.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const ai = async (message, conversationHistory) => {
  // Analyze user intent and determine which Algolia tools to use
  const intent = analyzeIntent(message);
  let mcpResults = {};

  // Execute relevant MCP tools based on intent
  if (intent.needsSearch) {
    try {
      const searchResult = await callMCPTool("searchSingleIndex", {
        query: message,
        hitsPerPage: 5,
      });
      mcpResults.searchResults = searchResult;
    } catch (error) {
      console.error("Search error:", error);
      mcpResults.searchError = error.message;
    }
  }

  if (intent.needsAnalytics) {
    try {
      const [topSearches, noResultsRate, topHits] = await Promise.allSettled([
        callMCPTool("getTopSearches", { limit: 10 }),
        callMCPTool("getNoResultsRate"),
        callMCPTool("getTopHits", { limit: 10 }),
      ]);

      mcpResults.analytics = {
        topSearches:
          topSearches.status === "fulfilled" ? topSearches.value : null,
        noResultsRate:
          noResultsRate.status === "fulfilled" ? noResultsRate.value : null,
        topHits: topHits.status === "fulfilled" ? topHits.value : null,
      };
    } catch (error) {
      console.error("Analytics error:", error);
      mcpResults.analyticsError = error.message;
    }
  }

  if (intent.needsIndexInfo) {
    try {
      const [indices, settings] = await Promise.allSettled([
        callMCPTool("listIndices"),
        callMCPTool("getSettings"),
      ]);

      mcpResults.indexInfo = {
        indices: indices.status === "fulfilled" ? indices.value : null,
        settings: settings.status === "fulfilled" ? settings.value : null,
      };
    } catch (error) {
      console.error("Index info error:", error);
      mcpResults.indexInfoError = error.message;
    }
  }

  if (intent.needsUserInfo) {
    try {
      const [userInfo, applications] = await Promise.allSettled([
        callMCPTool("getUserInfo"),
        callMCPTool("getApplications"),
      ]);

      mcpResults.userInfo = {
        user: userInfo.status === "fulfilled" ? userInfo.value : null,
        applications:
          applications.status === "fulfilled" ? applications.value : null,
      };
    } catch (error) {
      console.error("User info error:", error);
      mcpResults.userInfoError = error.message;
    }
  }

  const contextMessage =
    Object.keys(mcpResults).length > 0
      ? `\n\nAlgolia Data Context:\n${JSON.stringify(mcpResults, null, 2)}`
      : "";

  // Build conversation history for Groq
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: "user",
      content: message + contextMessage,
    },
  ];

  // Get response from Groq
  const completion = await groq.chat.completions.create({
    messages: messages,
    model: "llama-3.1-8b-instant", // or your preferred Llama model
    temperature: 0.7,
    max_tokens: 1024,
  });

  const aiResponse = completion.choices[0]?.message?.content;

  if (!aiResponse) {
    throw new Error("No response from Groq");
  }

  return { aiResponse, mcpResults, intent };
};

export default ai;
