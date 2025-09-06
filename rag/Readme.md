## RAG Chatter Box
### Overview
RAG Chatter Box is a web application that uses Azure AI to provide intelligent responses to queries based on external knowledge sources. The application uses Retrieval-Augmented Generation (RAG) to enhance the quality of AI responses by referencing relevant information from provided documents or web pages.

### Features
- Web-based user interface
- Knowledge base management through URL submission
- AI-powered chat responses using Azure AI services

### Technology Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Python, Flask
- AI Services:
  - Azure AI Embedding Service (text-embedding-3-small)
  - Azure AI Chat Completion (Phi-3-medium-4k-instruct)
- Libraries:
  - FAISS for vector similarity search
  - Azure AI Inference SDK
  - NumPy for numerical operations
### Setup Instructions
Prerequisites
- Python 3.8 or higher
- Azure AI account

Installation
1. Clone the repository
2. Install the required packages:
```py
pip install -r requirements.txt
```
3. Create a '.env' file with the following variables:
```py
embeddings_key=your_embeddings_api_key
chat_key=your_chat_api_key
```
Running the Application
1. Start the Flask server:
```py
python app.py
```
2. Open a web browser and navigate to http://127.0.0.1:5000
### Usage
1. Add resources to the knowledge base by pasting URLs in the sidebar input box
2. Wait for the resource to be processed
3. Type your question in the main chat interface
4. Receive AI-generated answers that are informed by the content of your resources
### Architecture
- Frontend: Simple and responsive interface with a sidebar for knowledge management
- Backend: Flask server handling requests and communication with AI services
- RAG Pipeline:
  1. Document retrieval and chunking
  2. Text embedding generation
  3. Vector similarity search
  4. Context-enhanced query processing
