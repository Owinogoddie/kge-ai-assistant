import formatMarkdown from '@/utils/markdownFormatter';
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const formattedContent = formatMarkdown(content);

  return (
    <div 
      className={`markdown-content ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};

export default MarkdownRenderer;