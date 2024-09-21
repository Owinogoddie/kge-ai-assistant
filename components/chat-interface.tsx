'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from "ai/react";
import MarkdownRenderer from './markdown-renderer';

export default function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const { messages, input, handleInputChange, handleSubmit, isLoading: chatEndpointIsLoading } =
    useChat({
      api: '/api/chat',
      initialMessages: [],
      onResponse(response) {
        // Process any headers or response data here if needed
      },
      streamMode: "text",
      onError: (e) => {
        console.error("Chat error:", e);
      }
    });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, welcomeMessage]);

  useEffect(() => {
    const welcomeText = "Welcome! I'm an AI assistant specialized in answering questions about KGE internships. How can I help you today?";
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < welcomeText.length) {
        setWelcomeMessage((prev) => welcomeText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 20);

    return () => clearInterval(intervalId);
  }, []);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (chatEndpointIsLoading) {
      return;
    }

    handleSubmit(e);
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-lg shadow-lg p-4 max-w-2xl mx-auto">
      <div className="h-96 overflow-y-auto mb-4" ref={messageContainerRef}>
        {welcomeMessage && (
          <div className="mb-4 flex justify-start">
            <span className="inline-block p-2 rounded-lg max-w-xs sm:max-w-sm bg-gray-300 text-gray-900 text-left">
              <MarkdownRenderer content={welcomeMessage} />
            </span>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span
              className={`inline-block p-2 rounded-lg max-w-xs sm:max-w-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white text-left'
                  : 'bg-gray-300 text-gray-900 text-left'
              }`}
            >
              <MarkdownRenderer content={message.content} />
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex mb-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-grow border border-blue-500 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          disabled={chatEndpointIsLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-0 focus:ring-blue-600"
          disabled={chatEndpointIsLoading}
        >
          {chatEndpointIsLoading ? 'Streaming...' : 'Send'}
        </button>
      </form>
    </div>
  );
}