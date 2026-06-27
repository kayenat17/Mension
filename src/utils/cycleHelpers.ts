export interface CycleState {
  currentDay: number;
  phase: "menstrual" | "follicular" | "ovulation" | "luteal";
  daysUntilNextPeriod: number;
}

/**
 * Calculates the user's current day of their menstrual cycle and phase
 * based on the Last Menstrual Period (LMP) date, cycle length, and period duration.
 * 
 * Luteal phase is constant at 14 days before the next period starts.
 * Menstrual phase corresponds to the days of active bleeding.
 * Follicular phase is the period in between.
 */
export function calculateCycleState(
  lmpDateString: string,
  cycleLength: number = 28,
  periodDuration: number = 5
): CycleState {
  if (!lmpDateString) {
    return { currentDay: 1, phase: "follicular", daysUntilNextPeriod: 28 };
  }

  const lmp = new Date(lmpDateString);
  const today = new Date();

  // Strip hours to do clean day calculations
  const lmpMidnight = new Date(lmp.getFullYear(), lmp.getMonth(), lmp.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffMs = todayMidnight.getTime() - lmpMidnight.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // If LMP is in the future, default to day 1
  if (diffDays < 0) {
    return { currentDay: 1, phase: "menstrual", daysUntilNextPeriod: cycleLength };
  }

  // Calculate current cycle day (1-indexed)
  const currentDay = diffDays + 1;
  const daysUntilNextPeriod = cycleLength - currentDay + 1;

  // Luteal phase is constant at 14 days before next period
  const ovulationDay = cycleLength - 14;

  let phase: "menstrual" | "follicular" | "ovulation" | "luteal" = "follicular";

  if (currentDay <= periodDuration) {
    phase = "menstrual";
  } else if (currentDay < ovulationDay) {
    phase = "follicular";
  } else if (currentDay === ovulationDay || currentDay === ovulationDay + 1) {
    // Ovulation is typically a 24-48 hour window
    phase = "ovulation";
  } else {
    phase = "luteal";
  }

  return {
    currentDay,
    phase,
    daysUntilNextPeriod
  };
}
