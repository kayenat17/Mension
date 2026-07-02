export const KEYS = {
  SAVED_ANALYSES: "ova-saved-analyses",
  CYCLE_TRACKER: "ova-cycle-tracker",
  COMMUNITY_ALIAS: "ova-community-alias",
  COMMUNITY_REACTIONS: "ova-community-reactions",
  LOGGED_SYMPTOMS: "ova-logged-symptoms",
  CURRENT_PHASE: "ova-cycle-phase",
};

export const getItem = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

export const setItem = (key: string, value: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

export const removeItem = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};
