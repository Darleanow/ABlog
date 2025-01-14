import { formatDistanceToNow } from "date-fns";
import { Image } from "@nextui-org/image";
import { Avatar } from "@nextui-org/avatar";
import { notFound } from "next/navigation";

import { ArticlesApi } from "@/lib/api/articles-api";

export default async function ArticlePage({
  params,
}: {
  readonly params: { slug: string };
}) {
  const articlesApi = new ArticlesApi();

  try {
    const article = await articlesApi.getArticleBySlug(params.slug);

    return (
      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex gap-2 mb-4">
            {article.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 text-sm bg-primary/10 rounded-full"
              >
                {category.name}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

          <div className="flex items-center gap-4 py-4 border-t border-b">
            <Avatar
              name={article.author.full_name}
              src={article.author.avatar_url ?? undefined}
            />
            <div>
              <p className="font-medium">{article.author.full_name}</p>
              <time className="text-sm text-default-500">
                {formatDistanceToNow(new Date(article.created_at))} ago
              </time>
            </div>
          </div>
        </header>

        {article.featured_image_url && (
          <div className="mb-8">
            <Image
              alt={article.title}
              className="w-full rounded-xl aspect-video object-cover"
              src={article.featured_image_url}
            />
          </div>
        )}

        <div
          dangerouslySetInnerHTML={{ __html: article.content }}
          className="prose prose-lg dark:prose-invert mx-auto"
        />

        {article.tags.length > 0 && (
          <footer className="mt-8 pt-4 border-t">
            <div className="flex gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-sm bg-default-100 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </footer>
        )}
      </article>
    );
  } catch (error: any) {
    notFound();
  }
}
