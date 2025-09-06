<h1 align="center">🔮 Potion</h1>

> [!NOTE]
>
> Potion is an AI-powered note-taking platform that transforms your thoughts into intelligent, searchable knowledge. Leveraging MindsDB's advanced AI capabilities, Potion enables semantic search, AI-generated summaries, and intelligent chat assistance to make your notes truly smart.

## 🎬 Project Showcase

| Demo Video       | Blog Post     |
| ---------------- | ------------- |
| [![Video](https://i.ytimg.com/vi/W2UIFzpttEE/hqdefault.jpg)](https://youtu.be/W2UIFzpttEE?si=zrNJWTBrltqWLQ4z) | [![Blog Post](https://media2.dev.to/dynamic/image/width=480,height=320,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Fupload%2Fv1751251734456%2F1751decc-ce67-4d2b-a80f-b6b145f451e8.png)](https://dev.to/abhinav-writes/meet-potion-your-smart-note-taking-companion-3bb8) |

## 🌟 Features

> **Potion** transforms your note-taking experience with:

- 🔍 **AI-Powered Search** – Find notes using natural language queries with semantic understanding and relevance ranking
- 📝 **Smart Summaries** – Instantly generate concise AI summaries of any note to extract key insights
- 💬 **Intelligent Chat** – Converse with your AI assistant about your notes and receive contextual answers
- 🏷️ **Organized Categories** – Effortlessly sort notes into categories (Class, Meeting, Personal, Research, Ideas)
- ⚡ **Real-time Sync** – Work seamlessly with localStorage persistence and MindsDB cloud synchronization
- 🎨 **Beautiful UI** – Enjoy a modern sticky note design with smooth animations and responsive layout

## 💻 Installation

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Docker Desktop (for MindsDB)

### Quick Setup

1. **Clone Repository**

```bash
git clone https://github.com/abhinavthedev/potion.git
cd potion
```

2. **Launch MindsDB**

```bash
# Start MindsDB container
docker-compose up -d

# MindsDB Console: http://127.0.0.1:47334
```

3. **Configure API Keys**

   - Create `.env` file from `.env.sample` with the following:

```
# Azure OpenAI Configuration
api_key=your_azure_openai_api_key
api_base_url=https://your-resource-name.openai.azure.com
embed_api_key=your_azure_embedding_api_key
embed_api_base_url=https://your-embedding-resource.openai.azure.com

# Google Cloud API
GOOGLE_API_KEY=your_google_api_key

# MindsDB Configuration
MindsDB_URL=http://127.0.0.1:47334
```

> [!TIP]
> Get API keys from [Azure OpenAI](https://ai.azure.com/) (deploy GPT-4 and text-embedding-3-small models) and [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Install & Run**

```bash
npm install
npm run dev

# Access at: http://localhost:3000
```

5. **Initialize AI Features**
   - Create your first notes
   - Click "Initiate AI Magic" button
   - Start searching and chatting with your notes

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | Vanilla JavaScript, CSS3, HTML5 |
| **Backend** | Node.js, Express.js |
| **AI & ML** | MindsDB, Azure OpenAI (GPT-4 & Embeddings), Google Gemini, ChromaDB |
| **Infrastructure** | Docker |

## 🚀 Usage

### Creating Notes
1. Click **Add Note** button
2. Enter title, select category, write content
3. Save to create your note

### AI-Powered Search
1. Activate AI capabilities
2. Use the bottom search bar with natural language
3. View results ranked by relevance

### AI Summaries & Chat
- Click on any note and select **Generate AI Summary**
- Use the chat icon (bottom right) to ask questions about your notes

## 📁 Project Structure

```
potion/
├── public/              # Frontend assets
│   ├── index.html       # Main HTML interface
│   ├── style.css        # Styling and animations
│   └── script.js        # Frontend logic
├── utils/               # Helper functions
├── app.js               # Express server
├── mindsdb.js           # MindsDB integration
├── setup.js             # Initial configuration
├── docker-compose.yml   # Docker setup
└── .env.sample          # Sample of Environment variables
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/setup` | Initialize MindsDB project |
| POST | `/api/mindsdb/initialize` | Set up knowledge base and models |
| POST | `/api/notes/search` | Semantic search through notes |
| POST | `/api/notes/summarize` | Generate note summaries |
| POST | `/api/chat` | Chat with AI about notes |
| POST | `/api/upload` | Upload notes to MindsDB |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **MindsDB not accessible** | • Ensure Docker is running<br>• Check container: `docker ps`<br>• Restart: `docker-compose restart mindsdb`<br>• Verify port 47334 is available |
| **AI features not working** | • Check MindsDB status<br>• Verify API keys<br>• Ensure notes exist before AI activation |
| **Search not returning results** | • Confirm AI activation<br>• Try broader search terms<br>• Check MindsDB connection |

> [!NOTE]
> For detailed installation help, see [MindsDB Installation Docs](https://docs.mindsdb.com/setup/self-hosted/docker#install-mindsdb)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

Potion is licensed under the `Unlicense`. See the LICENSE file for details.

## 👤 Author

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%">
        <a href="https://github.com/abhinavthedev">
          <img src="https://github.com/abhinavthedev.png?s=100" width="100px;" alt="Abhinav"/>
          <br />
          <b>Abhinav</b>
        </a>
      </td>
    </tr>
  </tbody>
</table>

---

<p align="center">🌟 If you find Potion helpful, please give it a star on GitHub! 🌟</p>
