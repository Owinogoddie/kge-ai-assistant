'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from "ai/react";
import MarkdownRenderer from './markdown-renderer';

export default function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading: chatEndpointIsLoading } =
    useChat({
      api: '/api/chat',
      onResponse(response) {
        setIsStreaming(true);
      },
      onFinish() {
        setIsStreaming(false);
      },
      streamMode: "text",
      onError: (e) => {
        console.error("Chat error:", e);
        setIsStreaming(false);
      }
    });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (chatEndpointIsLoading || isStreaming) {
      return;
    }

    window.parent.postMessage({ type: 'MESSAGE_SENT', message: input }, '*');

    handleSubmit(e);
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 backdrop-blur-lg p-4 flex flex-col rounded-lg shadow-2xl">
      <div className="bg-white rounded-t-lg p-3 mb-4 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Smart Assistant</h2>
      </div>
      <div 
        className="flex-grow overflow-y-auto mb-4 no-scrollbar bg-white rounded-lg shadow-inner p-4" 
        ref={messageContainerRef}
        style={{ maxHeight: 'calc(100% - 140px)' }}
      >
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span
              className={`inline-block p-3 rounded-lg max-w-xs sm:max-w-sm shadow-md ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <MarkdownRenderer content={message.content} />
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex bg-white rounded-lg shadow-md p-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-grow bg-gray-100 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          placeholder="Type your message..."
          disabled={chatEndpointIsLoading || isStreaming}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-200 ease-in-out"
          disabled={chatEndpointIsLoading || isStreaming}
        >
          {chatEndpointIsLoading || isStreaming ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}