export function sanitizeArticleContent(html: string): string {
  // Remove empty tags (e.g., <p></p>)
  const sanitizedHtml = html.replace(/<p>\s*<\/p>/g, "");

  // Ensure proper heading formatting
  const formattedHtml = sanitizedHtml
    .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-4xl font-bold mb-6">$1</h1>')
    .replace(
      /<h2>(.*?)<\/h2>/g,
      '<h2 class="text-3xl font-semibold mb-4">$1</h2>',
    );

  return formattedHtml;
}
