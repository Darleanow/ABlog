export interface Category {
  id: number;
  name: string;
  keywords?: string[];
}

export interface Tag {
  id: number;
  name: string;
  keywords?: string[];
}

export interface ClassificationResult {
  categoryId: number;
  categoryScore: number;
  tagIds: number[];
  tagScores: Map<number, number>;
}

class SmartTermExtractor {
  private readonly stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "were",
    "will",
    "with",
    "test",
    "tests",
    "testing",
  ]);

  extractTerms(text: string): Map<string, number> {
    const terms = new Map<string, number>();

    // Clean and normalize the text
    const normalizedText = text
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['"]/g, "'")
      .replace(/[.,!?;:]/g, " ")
      .trim();

    // Split into words and clean them
    const words = normalizedText
      .split(/\s+/)
      .filter((word) => this.isSignificantWord(word))
      .map((word) => this.normalizeWord(word));

    // Count unique words, handling repetitions intelligently
    const seenWords = Array.from(new Set(words));

    for (const word of seenWords) {
      const count = words.filter((w) => w === word).length;
      // Limit the impact of repetition - use log scale for repeated words
      const adjustedCount = Math.log2(count + 1);

      terms.set(word, adjustedCount);
    }

    // Extract potential compound terms
    this.extractCompoundTerms(words, terms);

    return terms;
  }

  private isSignificantWord(word: string): boolean {
    return word.length > 2 && !this.stopWords.has(word) && !/^\d+$/.test(word);
  }

  private normalizeWord(word: string): string {
    // Handle common programming language/framework names
    const scriptRegex = /^[a-z]+script$/i;

    if (scriptRegex.test(word)) return "javascript";

    const jsRegex = /^js$/i;

    if (jsRegex.test(word)) return "javascript";

    const tsRegex = /^ts$/i;

    if (tsRegex.test(word)) return "typescript";

    // Remove repetitive characters
    const repeatedPattern = this.findRepeatedPattern(word);

    if (repeatedPattern) {
      return repeatedPattern;
    }

    return word;
  }

  private findRepeatedPattern(str: string): string | null {
    for (let i = 2; i <= str.length / 2; i++) {
      const pattern = str.slice(0, i);
      const regex = new RegExp(`^(${pattern})+$`);

      if (regex.test(str)) {
        return pattern;
      }
    }

    return null;
  }

  private extractCompoundTerms(
    words: string[],
    terms: Map<string, number>,
  ): void {
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;

      if (this.isCompoundTerm(bigram)) {
        const currentScore = terms.get(bigram) ?? 0;

        terms.set(bigram, currentScore + 1.5);
      }
    }
  }

  private isCompoundTerm(term: string): boolean {
    const words = term.split(" ");

    return (
      words.length > 1 && words.every((word) => this.isSignificantWord(word))
    );
  }
}

class SmartSimilarityCalculator {
  calculateSimilarity(term1: string, term2: string): number {
    const normalized1 = term1.toLowerCase();
    const normalized2 = term2.toLowerCase();

    if (normalized1 === normalized2) return 1;

    // Check for substring matches
    if (
      normalized1.includes(normalized2) ||
      normalized2.includes(normalized1)
    ) {
      const lengthRatio =
        Math.min(normalized1.length, normalized2.length) /
        Math.max(normalized1.length, normalized2.length);

      return 0.8 * lengthRatio;
    }

    // Word-based similarity for compound terms
    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);
    const words2Set = new Set(words2);

    const intersection = words1.filter((x) => words2Set.has(x));
    const union = Array.from(new Set([...words1, ...words2]));

    if (intersection.length > 0) {
      return intersection.length / union.length;
    }

    return 0;
  }
}

export class ArticleClassifier {
  public readonly categories: Category[];
  public readonly tags: Tag[];
  private readonly termExtractor: SmartTermExtractor;
  private readonly similarityCalculator: SmartSimilarityCalculator;

  constructor(categories: Category[], tags: Tag[]) {
    this.categories = categories;
    this.tags = tags;
    this.termExtractor = new SmartTermExtractor();
    this.similarityCalculator = new SmartSimilarityCalculator();
  }

  classify(content: string, title: string): ClassificationResult {
    // Extract terms from content and title
    const titleTerms = this.termExtractor.extractTerms(title);
    const contentTerms = this.termExtractor.extractTerms(content);

    // Combine terms with appropriate weighting
    const combinedTerms = new Map<string, number>();

    // Process title terms
    const titleEntries = Array.from(titleTerms.entries());

    for (const [term, count] of titleEntries) {
      combinedTerms.set(term, count * 2); // Double weight for title terms
    }

    // Process content terms
    const contentEntries = Array.from(contentTerms.entries());

    for (const [term, count] of contentEntries) {
      const currentScore = combinedTerms.get(term) ?? 0;

      combinedTerms.set(term, currentScore + count);
    }

    // Calculate scores
    const categoryScores = new Map<number, number>();
    const tagScores = new Map<number, number>();

    // Process combined terms
    const termEntries = Array.from(combinedTerms.entries());

    for (const [term, termWeight] of termEntries) {
      // Score categories
      for (const category of this.categories) {
        const similarity = this.similarityCalculator.calculateSimilarity(
          term,
          category.name,
        );

        if (similarity > 0.2) {
          const currentScore = categoryScores.get(category.id) ?? 0;

          categoryScores.set(
            category.id,
            currentScore + similarity * termWeight,
          );
        }
      }

      // Score tags
      for (const tag of this.tags) {
        const similarity = this.similarityCalculator.calculateSimilarity(
          term,
          tag.name,
        );

        if (similarity > 0.2) {
          const currentScore = tagScores.get(tag.id) ?? 0;

          tagScores.set(tag.id, currentScore + similarity * termWeight);
        }
      }
    }

    // Normalize scores and select top results
    const normalizedCategoryScores = this.normalizeScores(categoryScores);
    const normalizedTagScores = this.normalizeScores(tagScores);

    const categoryEntries = Array.from(normalizedCategoryScores.entries());
    const sortedCategories = categoryEntries.toSorted((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories.find(([_, score]) => score > 0.3) ?? [
      this.categories[0].id,
      0,
    ];

    const tagEntries = Array.from(normalizedTagScores.entries());
    const sortedTags = tagEntries.toSorted((a, b) => b[1] - a[1]);
    const topTags = sortedTags
      .filter(([_, score]) => score > 0.25)
      .slice(0, 3)
      .map(([id]) => id);

    return {
      categoryId: topCategory[0],
      categoryScore: topCategory[1],
      tagIds: topTags,
      tagScores: normalizedTagScores,
    };
  }

  private normalizeScores(scores: Map<number, number>): Map<number, number> {
    const entries = Array.from(scores.entries());
    const values = entries.map(([_, score]) => score);
    const maxScore = Math.max(...values, 0.0001);

    const normalized = new Map<number, number>();

    for (const [id, score] of entries) {
      normalized.set(id, score / maxScore);
    }

    return normalized;
  }
}

export class ArticleClassifierFactory {
  public static create(categories: Category[], tags: Tag[]): ArticleClassifier {
    return new ArticleClassifier(categories, tags);
  }
}
