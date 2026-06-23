/**
 * Cycle phase emotional sensitivity contexts.
 *
 * Used by /api/analyze and /api/chat to inform Ova's responses
 * about how the user's current cycle phase affects their
 * emotional sensitivity and baseline.
 *
 * Extracted to a shared module to eliminate duplication.
 * Edit here — both routes pick up the change.
 */
export const PHASE_CONTEXTS: Record<string, string> = {
  menstrual:
    "Bleeding phase. Progesterone and estrogen are at their lowest. Energy is naturally low, " +
    "and physical/emotional vulnerability is high. Intuition is high, but feeling drained can " +
    "make you second-guess your boundaries.",
  follicular:
    "Post-period. Estrogen is rising. Energy, optimism, and mental focus are increasing, " +
    "meaning you are emotionally stable and clear-headed but might sometimes override your own " +
    "boundaries in favor of making things work.",
  ovulation:
    "Fertile window. Estrogen peaks. You feel highly social, confident, and communicative, " +
    "which can sometimes make you overly agreeable or prone to accommodating others at your own expense.",
  luteal:
    "Pre-period. Progesterone rises and drops. Anxiety, irritability, self-doubt, and vulnerability " +
    "naturally peak. Toxic or manipulative messages can hit much harder and feel biologically destabilizing, " +
    "often triggering intense self-blame.",
  general:
    "General state of mind. You want clarity and emotional grounding, separating facts from " +
    "anxiety and self-doubt."
};

/**
 * Normalizes a cycle phase value and validates it against known phases.
 * Returns the valid phase key, or "general" as default.
 */
export function normalizePhase(input: string | undefined): string {
  const phase = (input || "general").toLowerCase().trim();
  return PHASE_CONTEXTS[phase] ? phase : "general";
}
