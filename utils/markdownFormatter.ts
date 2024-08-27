const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatMarkdown = (markdown: string): string => {
  let formatted = escapeHtml(markdown);

  // Headers
  formatted = formatted.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  formatted = formatted.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  formatted = formatted.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Code blocks
  formatted = formatted.replace(
    /```([\s\S]*?)```/g,
    "<pre><code>$1</code></pre>"
  );

  // Inline code
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Lists
  formatted = formatted.replace(/^\s*\d+\.\s/gm, "<li>");
  formatted = formatted.replace(/^\s*[-*]\s/gm, "<li>");

  // Paragraphs
  formatted = "<p>" + formatted.replace(/\n{2,}/g, "</p><p>") + "</p>";

  // Clean up empty paragraphs
  formatted = formatted.replace(/<p><\/p>/g, "");

  return formatted;
};

export default formatMarkdown;
