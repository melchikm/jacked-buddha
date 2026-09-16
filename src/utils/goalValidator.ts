/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// EXAM PREPARATION PHRASES THAT ARE STRICTLY NOT LONG-TERM GOALS
const EXAM_PREP_PATTERNS = [
  /\bexam\b/i,
  /\bexams\b/i,
  /\btest\s*prep\b/i,
  /\bpreparations?\b/i,
  /\bpreparing\s*for\b/i,
  /\bexam\s*prep\b/i,
  /\bstudying\s*for\b/i,
  /\bgmat\b/i,
  /\bgre\b/i,
  /\bcat\s*exam\b/i,
  /\bsat\b/i,
  /\bielts\b/i,
  /\btoefl\b/i,
  /\bmcat\b/i,
  /\busmle\b/i,
  /\bboard\s*exam\b/i,
  /\bcertification\s*exam\b/i,
  /\binterview\s*prep\b/i,
  /\bcramming\b/i
];

export interface GoalValidationResult {
  isValid: boolean;
  isExamPrep: boolean;
  isTooShort: boolean;
  errorMessage?: string;
  guidanceMessage?: string;
}

/**
 * Validates whether a given goal meets the core life architecture standards:
 * 1. Long-term goals must have a minimum span of 3 months.
 * 2. Exam preparations or any preparations is strictly NOT a long-term goal.
 */
export function validateLongTermGoal(
  goalText: string,
  timelineMonths?: number | string
): GoalValidationResult {
  const trimmed = (goalText || "").trim();

  // Check empty
  if (!trimmed) {
    return {
      isValid: false,
      isExamPrep: false,
      isTooShort: false,
      errorMessage: "Please specify your long-term goal."
    };
  }

  // Check for Exam / Preparation patterns
  const detectedExamWord = EXAM_PREP_PATTERNS.find(pattern => pattern.test(trimmed));
  if (detectedExamWord) {
    return {
      isValid: false,
      isExamPrep: true,
      isTooShort: false,
      errorMessage: "Exam preparations or any short-term preparations is strictly NOT a long-term goal.",
      guidanceMessage: "Exam prep is a temporary milestone or monthly checkpoint, not an enduring life vision. A true long-term goal is the visionary life transformation beyond the exam (e.g. 'Lead Global Enterprise Architecture', 'Found an Autonomous AI Venture', 'Achieve Athletic Peak Physique & Sub-13% Body Fat', or 'Become a Board-Certified Surgeon'). What is your true long-term life vision?"
    };
  }

  // Check Timeline span (Minimum 3 months)
  if (timelineMonths !== undefined) {
    let months = typeof timelineMonths === "number" ? timelineMonths : parseInt(String(timelineMonths), 10);
    if (isNaN(months) && typeof timelineMonths === "string") {
      if (timelineMonths.includes("1 Month") || timelineMonths.includes("30 Days") || timelineMonths.includes("2 Weeks")) {
        months = 1;
      } else if (timelineMonths.includes("2 Month")) {
        months = 2;
      } else if (timelineMonths.includes("3 Month")) {
        months = 3;
      } else {
        months = 3; // default pass if descriptive
      }
    }

    if (months < 3) {
      return {
        isValid: false,
        isExamPrep: false,
        isTooShort: true,
        errorMessage: "A long-term goal must have a minimum duration of 3 months (90 days).",
        guidanceMessage: "Objectives shorter than 3 months belong as your Monthly Summit Milestone or Daily Tasks. Please select a horizon of at least 3 months for your long-term vision."
      };
    }
  }

  return {
    isValid: true,
    isExamPrep: false,
    isTooShort: false
  };
}

export const TIMELINE_OPTIONS = [
  { id: "3_months", label: "3 Months", months: 3, subtitle: "Minimum Strategic Horizon · Quarterly Transformation" },
  { id: "6_months", label: "6 Months", months: 6, subtitle: "Semiannual Horizon · Compound Discipline" },
  { id: "9_months", label: "9 Months", months: 9, subtitle: "Three-Quarter Horizon · Structural Leap" },
  { id: "12_months", label: "12 Months (1 Year)", months: 12, subtitle: "Annual Master Horizon · Recommended" },
  { id: "18_months", label: "18 Months", months: 18, subtitle: "Mid-Term Horizon · Sovereign Transformation" },
  { id: "24_months", label: "2+ Years", months: 24, subtitle: "Multi-Year Vision · Lifetime Mastery" }
];
