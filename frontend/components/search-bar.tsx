"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Input } from "@nextui-org/input";
import { Kbd } from "@nextui-org/kbd";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Fuse, { IFuseOptions } from "fuse.js";

import { SearchIcon } from "@/components/icons";
import { Article } from "@/lib/models/article";

interface SearchBarProps {
  articles: Article[];
}

const fuseOptions: IFuseOptions<Article> = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "excerpt", weight: 0.3 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

export const SearchBar = ({ articles }: SearchBarProps) => {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(true);

  const fuse = useMemo(() => new Fuse(articles, fuseOptions), [articles]);

  const resetSearch = useCallback(() => {
    setFilteredArticles([]);
    setSearchQuery("");
    setIsVisible(true);
    setIsFocused(false);
    setSelectedIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        resetSearch();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [resetSearch]);

  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if (e.key === "K" && e.shiftKey) {
        e.preventDefault();
        const inputElement = document.querySelector<HTMLInputElement>(
          'input[aria-label="Search"]',
        );

        if (inputElement) {
          inputElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcut);

    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = fuse.search(searchQuery);
      const sortedResults = results
        .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
        .map((result) => result.item);

      setFilteredArticles(sortedResults);
      setSelectedIndex(-1);
    } else {
      setFilteredArticles([]);
    }
  }, [searchQuery, fuse]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (filteredArticles.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredArticles.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleArticleClick(filteredArticles[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          resetSearch();
          break;
      }
    },
    [filteredArticles, selectedIndex, resetSearch],
  );

  const handleArticleClick = useCallback(
    (article: Article) => {
      setIsVisible(false);
      setSearchQuery("");
      setTimeout(() => {
        router.push(`/blog/${article.slug}`);
        resetSearch();
      }, 200);
    },
    [router, resetSearch],
  );

  return (
    <div ref={searchRef} className="relative">
      <Input
        aria-label="Search"
        classNames={{
          base: "max-w-full sm:max-w-[20rem]",
          inputWrapper: `
            bg-black/80 dark:bg-black/90
            hover:bg-black/90 dark:hover:bg-black
            border border-orange-500/10 dark:border-orange-500/5
            transition-all duration-300 group backdrop-blur-sm
            ${isFocused ? "ring-2 ring-orange-500/20 border-orange-500/30" : ""}
          `,
          input: `
            text-sm text-gray-300 dark:text-gray-300 
            placeholder:text-gray-500/80 dark:placeholder:text-gray-500/80
            group-hover:placeholder:text-gray-400 dark:group-hover:placeholder:text-gray-400
          `,
        }}
        endContent={
          <Kbd
            className="hidden lg:inline-block text-gray-500/80 group-hover:text-gray-400 dark:group-hover:text-gray-400 transition-colors"
            keys={["shift"]}
          >
            K
          </Kbd>
        }
        placeholder="Search articles..."
        radius="lg"
        startContent={
          <SearchIcon className="text-gray-500/80 group-hover:text-gray-400 dark:group-hover:text-gray-400 transition-colors pointer-events-none flex-shrink-0" />
        }
        value={searchQuery}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
      />

      <AnimatePresence mode="wait">
        {filteredArticles.length > 0 && isVisible && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-label="Search results"
            className="absolute mt-2 w-full bg-black/95 dark:bg-black rounded-2xl shadow-lg overflow-hidden z-50 backdrop-blur-sm ring-1 ring-orange-500/10"
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            role="dialog"
            transition={{ duration: 0.2 }}
          >
            <div className="overflow-hidden">
              <div className="px-2 py-2 border-b border-orange-500/10 dark:border-orange-500/5 bg-white/5">
                <div className="text-xs font-medium text-orange-400/90 dark:text-orange-400/90 px-2 py-1.5">
                  {filteredArticles.length === 1
                    ? "1 result found"
                    : `${filteredArticles.length} results found`}
                </div>
              </div>

              <ul
                aria-label="Search results"
                className="max-h-72 overflow-y-auto px-2 pb-2 
                  [scrollbar-width:thin]
                  [scrollbar-color:var(--scrollbar-thumb)_transparent]
                  [--scrollbar-thumb:linear-gradient(to_bottom,rgba(251,146,60,0.2),rgba(244,63,94,0.2))]
                  hover:[--scrollbar-thumb:linear-gradient(to_bottom,rgba(251,146,60,0.3),rgba(244,63,94,0.3))]
                  dark:[--scrollbar-thumb:linear-gradient(to_bottom,rgba(251,146,60,0.15),rgba(244,63,94,0.15))]
                  dark:hover:[--scrollbar-thumb:linear-gradient(to_bottom,rgba(251,146,60,0.25),rgba(244,63,94,0.25))]
                  [&::-webkit-scrollbar]:w-[5px]
                  [&::-webkit-scrollbar-track]:transparent
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)]"
                role="listbox"
                tabIndex={-1}
              >
                {filteredArticles.map((article, index) => (
                  <motion.li
                    key={article.id}
                    animate={{ opacity: 1, x: 0 }}
                    aria-selected={selectedIndex === index}
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    role="option"
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <button
                      className={`
                        w-full text-left group relative rounded-xl p-3 mt-1 first:mt-0
                        ${
                          selectedIndex === index
                            ? "bg-white/10 dark:bg-white/10"
                            : "hover:bg-white/5 dark:hover:bg-white/5"
                        }
                        transition-all duration-300
                        outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20
                      `}
                      onClick={() => handleArticleClick(article)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleArticleClick(article);
                        }
                      }}
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <h3 className="text-sm font-medium text-gray-200 dark:text-gray-200 group-hover:text-orange-400/90 dark:group-hover:text-orange-400/90 transition-colors duration-300 truncate pr-4">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-xs text-gray-400 dark:text-gray-400 mt-1 overflow-hidden text-ellipsis line-clamp-2 group-hover:text-gray-300 dark:group-hover:text-gray-300 transition-colors duration-300">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
