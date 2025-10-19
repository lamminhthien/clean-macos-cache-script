/**
 * Represents a cache category configuration
 */
export interface CacheCategory {
  /** Display name for the cache category */
  name: string;
  /** Paths to cache directories (supports glob patterns with ~) */
  paths: string[];
  /** Whether the cache requires sudo privileges to clean */
  requiresSudo: boolean;
  /** Optional warning message to display before cleaning */
  warning: string | null;
  /** Optional shell command to execute instead of directory cleaning */
  command?: string;
  /** Whether this category was auto-discovered */
  isAutoDiscovered?: boolean;
}

/**
 * Collection of cache categories indexed by key
 */
export interface CacheCategories {
  [key: string]: CacheCategory;
}

/**
 * Represents a scanned cache with calculated size
 */
export interface CacheResult {
  /** Unique key identifying the cache category */
  key: string;
  /** Display name for the cache */
  name: string;
  /** Total size in bytes */
  size: number;
  /** Array of found cache directory paths */
  paths: string[];
  /** Whether cleaning requires sudo privileges */
  requiresSudo: boolean;
  /** Optional warning message */
  warning: string | null;
  /** Optional shell command to execute */
  command?: string;
  /** Whether this cache was auto-discovered */
  isAutoDiscovered: boolean;
}

/**
 * Inquirer checkbox choice for cache selection
 */
export interface CacheChoice {
  /** Display name with size and icons */
  name: string;
  /** Cache key value */
  value: string;
  /** Whether the item is checked by default */
  checked: boolean;
}

/**
 * Answer from cache selection prompt
 */
export interface CacheSelectionAnswer {
  /** Array of selected cache keys */
  selected: string[];
}

/**
 * Answer from confirmation prompt
 */
export interface ConfirmAnswer {
  /** Whether the user confirmed the action */
  confirm: boolean;
}
