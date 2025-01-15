"use client";

import { Image } from "@nextui-org/image";

import { Article } from "@/lib/models/article";
import { sanitizeArticleContent } from "@/lib/utils/sanitize";

export function ArticleContent({ article }: { readonly article: Article }) {
  const sanitizedContent = sanitizeArticleContent(article.content);

  return (
    <>
      {article.featured_image_url && (
        <div className="mb-12">
          <Image
            alt={article.title}
            className="w-full rounded-2xl aspect-video object-cover shadow-lg hover:shadow-xl transition-shadow duration-300 ring-1 ring-orange-200/50 dark:ring-orange-800/30"
            src={article.featured_image_url}
          />
        </div>
      )}

      <div
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        className="prose prose-lg max-w-none mb-12 
          prose-headings:font-bold prose-headings:bg-gradient-to-r prose-headings:from-orange-600 prose-headings:to-rose-600 prose-headings:bg-clip-text prose-headings:text-transparent
          dark:prose-headings:from-orange-400 dark:prose-headings:to-rose-400
          prose-a:text-orange-500 dark:prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-lg prose-img:ring-1 prose-img:ring-orange-200/50 dark:prose-img:ring-orange-800/30
          prose-strong:text-orange-700/90 dark:prose-strong:text-orange-300/90
          prose-blockquote:border-l-orange-300 dark:prose-blockquote:border-l-orange-700
          prose-blockquote:text-orange-700/80 dark:prose-blockquote:text-orange-300/80
          dark:prose-invert"
      />
    </>
  );
}
