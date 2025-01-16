// Types and interfaces
export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface ClassificationResult {
  categoryId: number;
  tagIds: number[];
}

export interface DocumentTerms {
  terms: Map<string, number>;
  totalTerms: number;
}

export interface TopicExtractor {
  extractTopics(content: string): Map<string, number>;
}

export interface SimilarityCalculator {
  calculateSimilarity(term1: string, term2: string): number;
}

export interface CorpusAnalyzer {
  addDocument(content: string): void;
  getTermImportance(term: string): number;
}

// Base implementations
export class TfIdfCorpusAnalyzer implements CorpusAnalyzer {
  private readonly corpus: DocumentTerms[] = [];
  private readonly vocabularyIdf: Map<string, number> = new Map();

  public addDocument(content: string): void {
    const terms = this.extractTerms(content);

    this.corpus.push(terms);
    this.updateIdf();
  }

  public getTermImportance(term: string): number {
    return this.vocabularyIdf.get(term) ?? Math.log(2);
  }

  private extractTerms(text: string): DocumentTerms {
    const terms = new Map<string, number>();
    let totalTerms = 0;

    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    for (const word of words) {
      terms.set(word, (terms.get(word) ?? 0) + 1);
      totalTerms++;
    }

    return { terms, totalTerms };
  }

  private updateIdf(): void {
    const vocabulary = new Set<string>();

    for (const doc of this.corpus) {
      for (const [term] of Array.from(doc.terms.entries())) {
        vocabulary.add(term);
      }
    }

    for (const term of Array.from(vocabulary)) {
      const docsWithTerm = this.corpus.filter((doc) =>
        doc.terms.has(term),
      ).length;
      const idf = Math.log(this.corpus.length / (1 + docsWithTerm));

      this.vocabularyIdf.set(term, idf);
    }
  }
}

export class SmartTopicExtractor implements TopicExtractor {
  private readonly corpusAnalyzer: CorpusAnalyzer;
  private readonly domainTerms: Set<string>;

  constructor(
    corpusAnalyzer: CorpusAnalyzer,
    categories: Category[],
    tags: Tag[],
  ) {
    this.corpusAnalyzer = corpusAnalyzer;
    this.domainTerms = new Set([
      ...categories.map((c) => c.name.toLowerCase()),
      ...tags.map((t) => t.name.toLowerCase()),
    ]);
  }

  public extractTopics(content: string): Map<string, number> {
    const terms = this.extractMeaningfulTerms(content);
    const phrases = this.extractPhrases(content);

    const topics = new Map<string, number>();

    for (const [term, count] of Array.from(terms.entries())) {
      if (this.isSignificantTerm(term, count)) {
        topics.set(term, count * this.corpusAnalyzer.getTermImportance(term));
      }
    }

    for (const [phrase, count] of Array.from(phrases.entries())) {
      topics.set(phrase, count * 1.5);
    }

    return topics;
  }

  private extractMeaningfulTerms(text: string): Map<string, number> {
    const terms = new Map<string, number>();

    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    for (const word of words) {
      if (this.isLikelyMeaningful(word)) {
        terms.set(word, (terms.get(word) ?? 0) + 1);
      }
    }

    return terms;
  }

  private isLikelyMeaningful(term: string): boolean {
    if (term.length < 3) return false;
    if (/\d/.test(term)) return true;
    if (/[A-Z]/.test(term) && /[a-z]/.test(term)) return true;
    if (term.includes("-")) return true;
    if (this.domainTerms.has(term)) return true;

    return term.length > 5;
  }

  private extractPhrases(text: string): Map<string, number> {
    const phrases = new Map<string, number>();

    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words.slice(i, i + 2).join(" ");

      if (this.isLikelyMeaningfulPhrase(bigram)) {
        phrases.set(bigram, (phrases.get(bigram) ?? 0) + 1);
      }

      if (i < words.length - 2) {
        const trigram = words.slice(i, i + 3).join(" ");

        if (this.isLikelyMeaningfulPhrase(trigram)) {
          phrases.set(trigram, (phrases.get(trigram) ?? 0) + 1);
        }
      }
    }

    return phrases;
  }

  private isLikelyMeaningfulPhrase(phrase: string): boolean {
    return (
      this.domainTerms.has(phrase) ||
      phrase.split(" ").every((word) => this.isLikelyMeaningful(word))
    );
  }

  private isSignificantTerm(term: string, count: number): boolean {
    return count > 1 || this.domainTerms.has(term);
  }
}

export class JaccardSimilarityCalculator implements SimilarityCalculator {
  public calculateSimilarity(term1: string, term2: string): number {
    if (term1 === term2) return 1;
    if (term1.includes(term2) || term2.includes(term1)) return 0.8;

    const words1 = new Set(term1.split(" "));
    const words2 = new Set(term2.split(" "));

    const intersection = new Set(
      Array.from(words1).filter((x) => words2.has(x)),
    );
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);

    return intersection.size / union.size;
  }
}

export class ArticleClassifier {
  public readonly categories: Category[];
  public readonly tags: Tag[];
  private readonly topicExtractor: TopicExtractor;
  private readonly similarityCalculator: SimilarityCalculator;

  constructor(
    categories: Category[],
    tags: Tag[],
    corpusAnalyzer: CorpusAnalyzer,
    similarityCalculator: SimilarityCalculator,
  ) {
    this.categories = categories;
    this.tags = tags;
    this.topicExtractor = new SmartTopicExtractor(
      corpusAnalyzer,
      categories,
      tags,
    );
    this.similarityCalculator = similarityCalculator;
  }

  public classify(content: string, title: string): ClassificationResult {
    const topics = this.topicExtractor.extractTopics(content + " " + title);

    const categoryScores = new Map<number, number>();
    const tagScores = new Map<number, number>();

    for (const [topic, topicScore] of Array.from(topics.entries())) {
      for (const category of this.categories) {
        const similarity = this.similarityCalculator.calculateSimilarity(
          topic,
          category.name.toLowerCase(),
        );

        categoryScores.set(
          category.id,
          (categoryScores.get(category.id) ?? 0) + similarity * topicScore,
        );
      }

      for (const tag of this.tags) {
        const similarity = this.similarityCalculator.calculateSimilarity(
          topic,
          tag.name.toLowerCase(),
        );

        tagScores.set(
          tag.id,
          (tagScores.get(tag.id) ?? 0) + similarity * topicScore,
        );
      }
    }

    // Select top category and tags
    const categoryEntries = Array.from(categoryScores.entries());
    const tagEntries = Array.from(tagScores.entries());

    const topCategory = categoryEntries
      .toSorted((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0.3)
      .map(([id]) => id)[0];

    const topTags = tagEntries
      .toSorted((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0.3)
      .slice(0, 3)
      .map(([id]) => id);

    return {
      categoryId: topCategory,
      tagIds: topTags,
    };
  }
}

export class ArticleClassifierFactory {
  public static create(categories: Category[], tags: Tag[]): ArticleClassifier {
    const corpusAnalyzer = new TfIdfCorpusAnalyzer();
    const similarityCalculator = new JaccardSimilarityCalculator();

    return new ArticleClassifier(
      categories,
      tags,
      corpusAnalyzer,
      similarityCalculator,
    );
  }
}
