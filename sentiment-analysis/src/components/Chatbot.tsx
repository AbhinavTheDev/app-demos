import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '../types';
import { useCompany } from '../context/CompanyContext';
import { AzureOpenAI } from "openai";

// Set AZURE_OPENAI_ENDPOINT to the endpoint of your
// OpenAI resource. You can find this in the Azure portal.
// Load the .env file if it exists

export function Chatbot() {
  // console.log(import.meta.env.VITE_AZURE_OPENAI_API_KEY);
  // console.log(import.meta.env.VITE_AZURE_OPENAI_ENDPOINT);
  const { companyInfo } = useCompany();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: `Hello! Ask me about ${companyInfo}'s social media sentiment.`
    }
    
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input 
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const endpoint = import.meta.env.AZURE_OPENAI_ENDPOINT;  
      const apiKey = import.meta.env.AZURE_OPENAI_API_KEY;  
      
      const apiVersion = "2024-05-01-preview";  
      const deployment = "gpt-35-turbo-16k"; // This must match your deployment name
      
      const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment, dangerouslyAllowBrowser: true });  
      const result = await client.chat.completions.create({
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: deployment,
      });

      if (result.choices[0]?.message?.content) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: result.choices[0].message.content
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("The azure ai encountered an error:", error);
    }

    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Sentiment Analysis Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your company's sentiment..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}