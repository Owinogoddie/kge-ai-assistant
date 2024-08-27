'use client';

import EmbedChatInterface from '@/components/embed-chat-interface';
import React, { useEffect } from 'react';

export default function EmbedPage() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Since we're using localhost, we'll accept all origins during development
      // In production, you should check the origin
      
      if (event.data.type === 'INIT_CHAT') {
        console.log('Initializing chat with:', event.data);
        // Handle initialization
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent that the chat is ready
    window.parent.postMessage({ type: 'CHAT_READY' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <EmbedChatInterface/>
    </div>
  );
}