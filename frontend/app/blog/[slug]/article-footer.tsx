"use client";

import { Chip } from "@nextui-org/chip";

import { Tag } from "@/lib/models/tag";

export function ArticleFooter({ tags }: { readonly tags: Tag[] }) {
  if (tags.length === 0) return null;

  return (
    <footer className="flex flex-wrap gap-2 pt-6 border-t border-orange-100/50 dark:border-orange-800/30">
      {tags.map((tag) => (
        <Chip
          key={tag.id}
          className="text-xs hover:scale-105 transition-transform 
            bg-gradient-to-r from-orange-50/80 to-rose-50/80 
            text-orange-600/90 border-orange-100/50 
            hover:from-orange-100/80 hover:to-rose-100/80
            dark:from-orange-950/30 dark:to-rose-950/30 
            dark:text-orange-300/90 dark:border-orange-800/30"
          size="sm"
          variant="flat"
        >
          {tag.name}
        </Chip>
      ))}
    </footer>
  );
}
