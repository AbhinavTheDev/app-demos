import os
import requests
import numpy as np
import faiss
from dotenv import load_dotenv
from azure.ai.inference import EmbeddingsClient, ChatCompletionsClient
from azure.ai.inference.models import UserMessage
from azure.core.credentials import AzureKeyCredential

load_dotenv()

# For Serverless API or Managed Compute endpoints
embed_key = os.getenv("embeddings_key")
embed_endpoint = (
    "https://basic-rag-app.openai.azure.com/openai/deployments/text-embedding-3-small"
)
embed_model_name = "text-embedding-3-small"
embed_client = EmbeddingsClient(
    endpoint=embed_endpoint, credential=AzureKeyCredential(embed_key)
)

chat_endpoint = "https://abhin-marwbf2g-eastus2.services.ai.azure.com/models"
chat_model_name = "Phi-3-medium-4k-instruct"
chat_key = os.getenv("chat_key")
chat_client = ChatCompletionsClient(
    endpoint=chat_endpoint,
    credential=AzureKeyCredential(chat_key),
    api_version="2024-05-01-preview",
)


class RAGChatLogic:
    def __init__(self):
        self.text = None
        self.chunks = None
        self.index = None
        self.prompt = None
        self.qinput = None

    def get_resource_status(self, input):
        print("-------Stage 0---------")
        response = requests.get(input)
        self.text = response.text
        if response.status_code == 200:
            self.get_text()
            self.make_chunks()
            self.process_embeddings()
        return "it works" if response.status_code == 200 else "it doesn't work"

    def get_text(self):
        f = open("essay.txt", "w")
        f.write(self.text)
        f.close()
        print("-------Stage 1---------")
        print("No. of Characters", len(self.text))

    def make_chunks(self):
        chunk_size = 2048
        chunks = [
            self.text[i : i + chunk_size] for i in range(0, len(self.text), chunk_size)
        ]
        print("---------------Stage 2---------")
        print("Number of chunks", len(chunks))
        self.chunks = chunks

    def get_text_embedding(self, input):
        embeddings_batch_response = embed_client.embed(
            input=input, model=embed_model_name
        )
        return embeddings_batch_response.data[0].embedding

    def process_embeddings(self):
        text_embeddings = np.array(
            [self.get_text_embedding(chunk) for chunk in self.chunks]
        )

        print("---------------Stage 3----------")
        print("embedding ki shape", text_embeddings.shape)

        print("embeddings", text_embeddings)

        d = text_embeddings.shape[1]
        index = faiss.IndexFlatL2(d)
        index.add(text_embeddings)
        return index

    def process_question(self, input):
        if self.chunks is None and self.text is not None:
            self.make_chunks()

        if self.chunks is None:
            raise ValueError(
                "No document has been loaded. Please add a resource first."
            )

        question = input
        question_embeddings = np.array([self.get_text_embedding(question)])

        print("---------------Stage 4----------")
        print("Question ki embedding ki shape", question_embeddings.shape)

        print("Question ki embedding", question_embeddings)

        index = self.process_embeddings()
        D, I = index.search(question_embeddings, k=2)
        print(I)

        retrieved_chunk = [self.chunks[i] for i in I.tolist()[0]]
        print(retrieved_chunk)
        self.prompt = f"""
                   Context information is below.
                   ---------------------
                   {retrieved_chunk}
                   ---------------------
                   Given the context information and not prior knowledge, answer the query.
                   Query: {question}
                   Answer:
                   """

    def get_chat_response(self, model=chat_model_name):
        user_message = self.prompt
        messages = [UserMessage(content=user_message)]
        chat_response = chat_client.complete(model=model, messages=messages)
        return chat_response.choices[0].message.content

    # print(get_chat_response(prompt))
