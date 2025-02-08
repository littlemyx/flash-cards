/**
 * Implementation of the SuperMemo 2 (SM-2) spaced repetition algorithm
 */

const MIN_EASE_FACTOR = 1.3; // 130%
const INITIAL_EASE_FACTOR = 2.5; // 250%

export interface ReviewResult {
  interval: number;      // Days until next review
  easeFactor: number;    // Ease factor multiplier (stored as percentage)
  repetitions: number;   // Number of successful reviews in a row
  nextReview: Date;      // Next review date
}

/**
 * Calculate the next review schedule based on quality response 
 * @param quality - Rating from 0 to 5 (0=worst, 5=best)
 * @param currentInterval - Current interval in days
 * @param currentEF - Current ease factor (stored as percentage e.g. 250 = 2.5)
 * @param currentRepetitions - Current number of successful repetitions
 * @returns ReviewResult with updated scheduling information
 */
export function calculateNextReview(
  quality: number,
  currentInterval: number,
  currentEF: number,
  currentRepetitions: number
): ReviewResult {
  // Convert ease factor from percentage to decimal for calculations
  let easeFactor = currentEF / 100;
  
  // Calculate new ease factor
  easeFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let interval = 1;
  let repetitions = currentRepetitions;

  // If quality response is >= 3 (passing grade)
  if (quality >= 3) {
    repetitions += 1;
    
    // Calculate next interval based on repetition number
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
  } else {
    // Failed review - reset repetitions
    repetitions = 0;
    interval = 1;
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    easeFactor: Math.round(easeFactor * 100), // Convert back to percentage
    repetitions,
    nextReview
  };
}

/**
 * Initialize a new card with default spaced repetition values
 */
export function initializeCard(): Pick<ReviewResult, 'easeFactor' | 'interval' | 'repetitions'> {
  return {
    interval: 0,
    easeFactor: Math.round(INITIAL_EASE_FACTOR * 100), // 250%
    repetitions: 0
  };
}

/**
 * Check if a card is due for review
 */
export function isDue(nextReview: Date): boolean {
  return nextReview <= new Date();
}

/**
 * Calculate success rate as a percentage (0-100)
 */
export function calculateSuccessRate(
  totalReviews: number,
  successfulReviews: number
): number {
  if (totalReviews === 0) return 0;
  return Math.round((successfulReviews / totalReviews) * 100);
}

/**
 * Determine mastery level based on number of successful repetitions
 * @returns 'new' | 'learning' | 'mastered'
 */
export function getMasteryLevel(repetitions: number): 'new' | 'learning' | 'mastered' {
  if (repetitions === 0) return 'new';
  if (repetitions < 4) return 'learning';
  return 'mastered';
}
