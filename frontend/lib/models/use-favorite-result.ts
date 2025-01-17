export interface UseFavoritesResult {
  isFavorited: boolean;
  isLoading: boolean;
  error: string | null;
  toggleFavorite: () => Promise<void>;
}
