import { TaxonomyService } from '../../src/services/auto-taxonomy.service';
import { supabase } from '../../src/config/database';
import { describe, jest, beforeEach, expect, it } from '@jest/globals';
import type { Mock, SpyInstance } from 'jest-mock';


jest.mock('../../src/config/database', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('TaxonomyService', () => {
  let service: TaxonomyService;
  let mockSupabaseFrom: Mock;
  let mockSelect: Mock;
  let mockInsert: Mock;
  let mockSingle: Mock;
  let consoleSpy: SpyInstance;


  beforeEach(() => {
    jest.clearAllMocks();
    
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockSingle = jest.fn().mockImplementation(async () => ({
      data: null,
      error: null
    }));

    mockInsert = jest.fn().mockImplementation(() => ({ 
      select: () => ({ single: mockSingle })
    }));

    mockSelect = jest.fn().mockImplementation(() => ({ 
      ilike: () => ({ single: mockSingle })
    }));

    mockSupabaseFrom = jest.fn().mockImplementation(() => ({
      select: mockSelect,
      insert: mockInsert,
      single: mockSingle
    }));
    
    (supabase.from as Mock) = mockSupabaseFrom;
    service = new TaxonomyService();
  });

  describe("normalizeName", () => {
    it("should properly normalize category names", async () => {
      const testCases = [
        { input: "web development", expected: "Web Development" },
        {
          input: "  artificial  intelligence  ",
          expected: "Artificial Intelligence",
        },
        { input: "MACHINE learning", expected: "Machine Learning" },
        { input: "dataScience", expected: "Datascience" },
      ];

      for (const { input, expected } of testCases) {
        const result = (service as any).normalizeName(input);
        expect(result).toBe(expected);
      }
    });
  });

  describe("generateSlug", () => {
    it("should generate proper slugs from names", async () => {
      const testCases = [
        { input: "Web Development", expected: "web-development" },
        {
          input: "Artificial Intelligence!!",
          expected: "artificial-intelligence",
        },
        { input: "  Machine Learning  ", expected: "machine-learning" },
        { input: "React.js & Next.js", expected: "react-js-next-js" },
      ];

      for (const { input, expected } of testCases) {
        const result = (service as any).generateSlug(input);
        expect(result).toBe(expected);
      }
    });
  });

  describe("ensureCategories", () => {
    it("should return existing category when found", async () => {
      const existingCategory = {
        id: 1,
        name: "Technology",
      };

      mockSingle.mockImplementationOnce(async () => ({
        data: existingCategory,
        error: null,
      }));

      const result = await service.ensureCategories(["technology"]);

      expect(result).toEqual([existingCategory]);
      expect(mockSupabaseFrom).toHaveBeenCalledWith("categories");
      expect(mockSelect).toHaveBeenCalledWith("id, name");
    });

    it("should create new category when not found", async () => {
      mockSingle.mockImplementationOnce(async () => ({
        data: null,
        error: null,
      }));

      const newCategory = {
        id: 1,
        name: "Technology",
      };

      mockSingle.mockImplementationOnce(async () => ({
        data: newCategory,
        error: null,
      }));

      const result = await service.ensureCategories(["technology"]);

      expect(result).toEqual([
        {
          id: newCategory.id,
          name: newCategory.name,
        },
      ]);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Technology",
          slug: "technology",
        })
      );
    });

    it("should handle multiple categories in one call", async () => {
      const categories = [
        { id: 1, name: "Technology" },
        { id: 2, name: "Programming" },
      ];

      mockSingle
        .mockImplementationOnce(async () => ({
          data: categories[0],
          error: null,
        }))
        .mockImplementationOnce(async () => ({
          data: categories[1],
          error: null,
        }));

      const result = await service.ensureCategories([
        "technology",
        "programming",
      ]);

      expect(result).toEqual(categories);
      expect(mockSupabaseFrom).toHaveBeenCalledTimes(2);
    });
  });

  describe("ensureTags", () => {
    it("should return existing tag when found", async () => {
      const existingTag = {
        id: 1,
        name: "JavaScript",
      };

      mockSingle.mockImplementationOnce(async () => ({
        data: existingTag,
        error: null,
      }));

      const result = await service.ensureTags(["javascript"]);

      expect(result).toEqual([existingTag]);
      expect(mockSupabaseFrom).toHaveBeenCalledWith("tags");
      expect(mockSelect).toHaveBeenCalledWith("id, name");
    });

    it("should create new tag when not found", async () => {
      mockSingle.mockImplementationOnce(async () => ({
        data: null,
        error: null,
      }));

      const newTag = {
        id: 1,
        name: "JavaScript",
      };

      mockSingle.mockImplementationOnce(async () => ({
        data: newTag,
        error: null,
      }));

      const result = await service.ensureTags(["javascript"]);

      expect(result).toEqual([
        {
          id: newTag.id,
          name: newTag.name,
        },
      ]);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Javascript",
          slug: "javascript",
        })
      );
    });
  });

  describe("createArticleCategories", () => {
    it("should create article-category associations", async () => {
      const mockInsertFn = jest.fn().mockImplementation(async () => ({
        data: null,
        error: null,
      }));

      mockSupabaseFrom.mockImplementationOnce(() => ({
        insert: mockInsertFn,
      }));

      await service.createArticleCategories(1, [1, 2]);

      expect(mockSupabaseFrom).toHaveBeenCalledWith("article_categories");
      expect(mockInsertFn).toHaveBeenCalledWith([
        { article_id: 1, category_id: 1 },
        { article_id: 1, category_id: 2 },
      ]);
    });

    it("should throw error if association creation fails", async () => {
      const error = new Error("Database error");
      const mockInsertFn = jest.fn().mockImplementation(async () => ({
        data: null,
        error,
      }));

      mockSupabaseFrom.mockImplementationOnce(() => ({
        insert: mockInsertFn,
      }));

      await expect(service.createArticleCategories(1, [1])).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("createArticleTags", () => {
    it("should create article-tag associations", async () => {
      const mockInsertFn = jest.fn().mockImplementation(async () => ({
        data: null,
        error: null,
      }));

      mockSupabaseFrom.mockImplementationOnce(() => ({
        insert: mockInsertFn,
      }));

      await service.createArticleTags(1, [1, 2]);

      expect(mockSupabaseFrom).toHaveBeenCalledWith("article_tags");
      expect(mockInsertFn).toHaveBeenCalledWith([
        { article_id: 1, tag_id: 1 },
        { article_id: 1, tag_id: 2 },
      ]);
    });

    it("should throw error if association creation fails", async () => {
      const error = new Error("Database error");
      const mockInsertFn = jest.fn().mockImplementation(async () => ({
        data: null,
        error,
      }));

      mockSupabaseFrom.mockImplementationOnce(() => ({
        insert: mockInsertFn,
      }));

      await expect(service.createArticleTags(1, [1])).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("error handling", () => {
    it("should handle database errors in ensureCategories", async () => {
      mockSingle
        .mockImplementationOnce(async () => ({
          data: null,
          error: null,
        }))
        .mockImplementationOnce(async () => ({
          data: null,
          error: new Error("Database error"),
        }));

      const result = await service.ensureCategories(["Technology"]);
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to create category Technology:",
        expect.any(Error)
      );
    });

    it("should handle database errors in ensureTags", async () => {
      mockSingle
        .mockImplementationOnce(async () => ({
          data: null,
          error: null,
        }))
        .mockImplementationOnce(async () => ({
          data: null,
          error: new Error("Database error"),
        }));

      const result = await service.ensureTags(["JavaScript"]);
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to create tag Javascript:",
        expect.any(Error)
      );
    });
  });
});