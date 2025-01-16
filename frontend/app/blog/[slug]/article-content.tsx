import React from "react";
import { Image } from "@nextui-org/image";

import { Article } from "@/lib/models/article";
import { sanitizeArticleContent } from "@/lib/utils/sanitize";

export function ArticleContent({ article }: { readonly article: Article }) {
  const sanitizedContent = sanitizeArticleContent(article.content);

  return (
    <div className="space-y-8">
      {article.featured_image_url && (
        <div className="mb-16">
          <Image
            alt={article.title}
            className="w-full rounded-2xl aspect-video object-cover shadow-lg hover:shadow-xl transition-shadow duration-300 ring-1 ring-orange-200/50 dark:ring-orange-800/30"
            src={article.featured_image_url}
          />
        </div>
      )}

      <div
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        className="[&_h2]:text-4xl [&_h2]:font-extrabold [&_h2]:mb-8 
          [&_h2]:bg-gradient-to-r [&_h2]:from-orange-600 [&_h2]:to-rose-600 
          [&_h2]:bg-clip-text [&_h2]:text-transparent
          dark:[&_h2]:from-orange-400 dark:[&_h2]:to-rose-400
          
          [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-12 [&_h3]:mb-6
          [&_h3]:text-orange-700 dark:[&_h3]:text-orange-300
          
          [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-6
          dark:[&_p]:text-gray-300
          
          [&_strong]:font-semibold [&_strong]:text-orange-700
          dark:[&_strong]:text-orange-300
          
          [&_code]:px-2 [&_code]:py-1 
          [&_code]:bg-orange-100 [&_code]:text-orange-800
          [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
          dark:[&_code]:bg-orange-900/30 dark:[&_code]:text-orange-200
          
          [&_ul]:space-y-3 [&_ul]:my-6 [&_ul]:pl-6
          
          [&_li]:relative [&_li]:pl-6
          [&_li]:before:absolute [&_li]:before:left-0 
          [&_li]:before:top-[0.6em] [&_li]:before:w-1.5
          [&_li]:before:h-1.5 [&_li]:before:rounded-full
          [&_li]:before:bg-gradient-to-r 
          [&_li]:before:from-orange-400 [&_li]:before:to-rose-400
          
          [&_hr]:my-12 [&_hr]:border-none [&_hr]:h-px
          [&_hr]:bg-gradient-to-r [&_hr]:from-orange-200 [&_hr]:to-rose-200
          dark:[&_hr]:from-orange-800 dark:[&_hr]:to-rose-800
          
          [&_h3>strong]:font-inherit [&_h3>strong]:text-inherit
          [&_li>p]:my-0 [&_li>p]:inline-block
          [&_li>p>strong]:text-orange-600 [&_li>p>strong]:dark:text-orange-400"
      />
    </div>
  );
}

export default ArticleContent;
