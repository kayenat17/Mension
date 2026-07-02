export const KEYS = {
  SAVED_ANALYSES: "clara-saved-analyses",
  CYCLE_TRACKER: "clara-cycle-tracker",
  COMMUNITY_ALIAS: "clara-community-alias",
  COMMUNITY_REACTIONS: "clara-community-reactions",
  LOGGED_SYMPTOMS: "clara-logged-symptoms",
  CURRENT_PHASE: "clara-cycle-phase",
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
