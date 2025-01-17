import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader } from "lucide-react";

import { ArticleHeader } from "./article-header";
import { ArticleContent } from "./article-content";
import { ArticleFooter } from "./article-footer";
import { CommentsSection } from "./article-comments";

import { ArticlesApi } from "@/lib/api/articles-api";

interface PageProps {
  readonly params: {
    readonly slug: string;
  };
}

interface ArticleContentProps {
  readonly slug: string;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Loader className="w-12 h-12 text-orange-500 animate-spin" />
    </div>
  );
}

async function ArticlePage({ slug }: ArticleContentProps) {
  const articlesApi = new ArticlesApi();
  const article = await articlesApi.getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="px-6 lg:px-8 py-2 relative">
      <ArticleHeader article={article} />
      <ArticleContent article={article} />
      <ArticleFooter tags={article.tags} />
      <CommentsSection articleId={article.id} />
    </div>
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<Spinner />}>
      <ArticlePage slug={slug} />
    </Suspense>
  );
}
