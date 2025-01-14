import { IArticleRepository } from "../repositories/article-repository.interface";
import { Article } from "../models/article";
import { Category } from "../models/category";

export class ArticleService {
  constructor(private readonly articleRepository: IArticleRepository) {}

  async getArticles(): Promise<Article[]> {
    return this.articleRepository.getArticles();
  }

  async getArticlesByCategory(categorySlug: string): Promise<Article[]> {
    if (categorySlug === "all") {
      return this.getArticles();
    }

    return this.articleRepository.getArticlesByCategory(categorySlug);
  }

  extractCategories(articles: Article[]): Category[] {
    const categoryMap = new Map<string, Category>();

    articles.forEach((article) => {
      article.categories.forEach((category) => {
        if (!categoryMap.has(category.slug)) {
          categoryMap.set(category.slug, category);
        }
      });
    });

    return Array.from(categoryMap.values());
  }
}
