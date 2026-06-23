/**
 * Storage helper for Mension.
 * Handles the migration from legacy `clara-*` keys to `mension-*` keys.
 *
 * All components should use these helpers instead of directly accessing localStorage.
 */

const PREFIX = "mension-";
const LEGACY_PREFIX = "clara-";

export const KEYS = {
  CYCLE_PHASE: "cycle-phase",
  CHAT_HISTORY: "chat-history",
  CYCLE_TRACKER: "cycle-tracker",
  CURRENT_PHASE: "current-phase",
  SAVED_ANALYSES: "saved-analyses",
  LOGGED_SYMPTOMS: "logged-symptoms",
  COMMUNITY_ALIAS: "community-alias",
  COMMUNITY_REACTIONS: "community-reactions",
} as const;

/**
 * Migrate all legacy clara-* keys to mension-* keys.
 * Safe to call multiple times — it only migrates if clara-* exists and mension-* doesn't.
 */
export function migrateLegacyKeys(): void {
  if (typeof window === "undefined") return;

  Object.values(KEYS).forEach((key) => {
    const legacyKey = `${LEGACY_PREFIX}${key}`;
    const newKey = `${PREFIX}${key}`;

    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, legacyValue);
    }
  });
}

/**
 * Get an item from storage. Tries mension-* first, falls back to clara-*,
 * and migrates the value forward if found in legacy key.
 */
export function getItem(key: string): string | null {
  if (typeof window === "undefined") return null;

  const newKey = `${PREFIX}${key}`;
  const legacyKey = `${LEGACY_PREFIX}${key}`;

  // Try new key first
  const value = localStorage.getItem(newKey);
  if (value !== null) return value;

  // Fall back to legacy key and migrate
  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue !== null) {
    localStorage.setItem(newKey, legacyValue);
    return legacyValue;
  }

  return null;
}

/**
 * Set an item in storage under mension-* key.
 * Also removes the legacy clara-* key if it exists (cleanup).
 */
export function setItem(key: string, value: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(`${PREFIX}${key}`, value);
  // Clean up legacy key
  localStorage.removeItem(`${LEGACY_PREFIX}${key}`);
}

/**
 * Remove an item from both mension-* and legacy clara-* keys.
 */
export function removeItem(key: string): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(`${PREFIX}${key}`);
  localStorage.removeItem(`${LEGACY_PREFIX}${key}`);
}
