import { Article } from "./article";

export type Size = "large" | "default" | "tall" | "wide";
export type Variant = "default" | "minimal" | "featured";

export interface BentoGridProps {
  readonly articles: Article[];
  readonly onUnfavorite?: () => void;
}

export interface BentoCardProps {
  readonly article: Article;
  readonly size?: Size;
  readonly variant?: Variant;
  readonly onUnfavorite?: () => void;
}
