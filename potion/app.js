import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import MindsDBIntegration from "./mindsdb.js";
import { uploadNotesData } from "./utils/utils.js";
import setup from "./setup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Initialize MindsDB service
const mindsdb = new MindsDBIntegration();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Upload notes data to MindsDB
app.post("/api/upload", async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || !Array.isArray(notes)) {
      return res.status(400).json({ error: "Notes array is required" });
    }

    const result = await uploadNotesData(notes);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize MindsDB setup (Project + ML Engine)
app.post("/api/setup", async (req, res) => {
  try {
    const result = await setup();
    res.json({ success: true, message: "Setup completed", data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize MindsDB with notes (KB + Models + Agent)
app.post("/api/mindsdb/initialize", async (req, res) => {
  try {
    const { notes } = req.body;
    const result = await mindsdb.initializeMindsDB(notes);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Feature 1: Search notes using knowledge base
app.post("/api/notes/search", async (req, res) => {
  try {
    const { searchTerm } = req.body;

    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }

    const result = await mindsdb.searchNotes(searchTerm);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Feature 2: Get AI summary for specific note
app.post("/api/notes/summarize", async (req, res) => {
  try {
    const { noteId, title, content, category } = req.body;

    if (!noteId && (!title || !content)) {
      return res.status(400).json({ error: "Note ID or title and content are required" });
    }

    let result;
    if (noteId) {
      // Get summary from existing model using noteId
      result = await mindsdb.getSummary(noteId);
    } else {
      // Generate new summary using title/content
      result = await mindsdb.generateSummary(title, content, category);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Feature 3: Chat with AI agent
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await mindsdb.chatWithAgent(message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Express server running at http://localhost:${port}/api`);
  console.log(`📊 MindsDB endpoint: ${process.env.MindsDB_URL}`);
  console.log(`🌐 Frontend: http://localhost:${port}`);
});

export default app;
