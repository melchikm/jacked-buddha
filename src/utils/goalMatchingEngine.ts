import { CouncilAgent, COUNCIL_AGENTS, UserLongTermGoals } from "../types";

export interface GoalMatchedAgent {
  agent: CouncilAgent;
  matchedGoalTitle: string;
  matchedCategory: "health" | "career" | "skills" | "lifestyle" | "creative" | "finance" | "travel" | "spirituality";
  recommendationReason: string;
  suggestedStarterQuery: string;
}

export function getGoalMatchedAgents(goals?: UserLongTermGoals): GoalMatchedAgent[] {
  const matched: GoalMatchedAgent[] = [];
  const addedAgentIds = new Set<string>();

  const healthText = (goals?.healthGoal || "").toLowerCase();
  const careerText = (goals?.careerGoal || "").toLowerCase();
  const skillsText = (goals?.skillsGoal || "").toLowerCase();
  const lifestyleText = (goals?.lifestyleGoal || "").toLowerCase();
  const primaryText = (goals?.primaryAppGoal || "").toLowerCase();

  const addMatch = (
    agentId: string,
    category: GoalMatchedAgent["matchedCategory"],
    matchedGoalTitle: string,
    recommendationReason: string,
    suggestedStarterQuery: string
  ) => {
    if (addedAgentIds.has(agentId)) return;
    const agent = COUNCIL_AGENTS.find((a) => a.id === agentId);
    if (!agent) return;
    addedAgentIds.add(agentId);
    matched.push({
      agent,
      matchedGoalTitle,
      matchedCategory: category,
      recommendationReason,
      suggestedStarterQuery
    });
  };

  // 1. Health & Body Goals
  if (healthText || primaryText.includes("body") || primaryText.includes("fit") || primaryText.includes("health")) {
    const goalTitle = goals?.healthGoal || "Build peak physical vitality, strength, and longevity";
    addMatch(
      "fitness",
      "health",
      goalTitle,
      "Guarding your physique hypertrophy, progressive overload, and joint preservation biomechanics.",
      "How do we structure my training split to protect my joints while maximizing muscle hypertrophy?"
    );

    if (healthText.includes("diet") || healthText.includes("nutrition") || healthText.includes("food") || healthText.includes("fat") || healthText.includes("protein") || healthText.includes("weight")) {
      addMatch(
        "nutrition",
        "health",
        goalTitle,
        "Calibrating daily macronutrients, meal timing, and clean metabolic fuel for your body target.",
        "What are the best high-protein food swaps to hit my daily target cleanly?"
      );
    }

    if (healthText.includes("sleep") || healthText.includes("recovery") || healthText.includes("fatigue")) {
      addMatch(
        "recovery",
        "health",
        goalTitle,
        "Optimizing circadian rhythm, parasympathetic nervous system recovery, and restorative sleep.",
        "How can I deepen slow-wave sleep and wake up with maximal CNS energy?"
      );
    }
  }

  // 2. Career & Financial Goals
  if (careerText || primaryText.includes("money") || primaryText.includes("wealth") || primaryText.includes("career") || primaryText.includes("finance")) {
    const goalTitle = goals?.careerGoal || "Scale career impact, leadership, and financial sovereignty";
    if (careerText.includes("money") || careerText.includes("wealth") || careerText.includes("invest") || careerText.includes("save") || careerText.includes("₹") || careerText.includes("$") || careerText.includes("fund")) {
      addMatch(
        "finance",
        "finance",
        goalTitle,
        "Architecting sovereign capital compounding, asset allocation, and intentional ₹0 spend discipline.",
        "What is the most aggressive yet sustainable asset allocation strategy for my capital reserves?"
      );
    }

    addMatch(
      "career",
      "career",
      goalTitle,
      "Positioning for high leverage, executive authority, corporate navigation, and high-value project delivery.",
      "What are the 2 highest-leverage actions I should execute in my career this quarter?"
    );
  }

  // 3. Skills, Intellectual & Educational Goals
  if (skillsText || primaryText.includes("learn") || primaryText.includes("mba") || primaryText.includes("gmat") || primaryText.includes("study")) {
    const goalTitle = goals?.skillsGoal || "Deep cognitive mastery and deliberate high-leverage skill acquisition";
    if (skillsText.includes("mba") || skillsText.includes("gmat") || skillsText.includes("cat") || skillsText.includes("exam") || skillsText.includes("school") || skillsText.includes("college")) {
      addMatch(
        "mba",
        "skills",
        goalTitle,
        "Synthesizing GMAT quantitative/verbal drills, error logs, and elite admission blueprints.",
        "How should I structure my 2-hour daily study block between Verbal and Quant?"
      );
    } else {
      addMatch(
        "reading",
        "skills",
        goalTitle,
        "Extracting mental models, deliberate reading habits, and syntheses of core foundational texts.",
        "How can I retain and synthesize deep concepts from complex books without cognitive overload?"
      );
    }

    addMatch(
      "productivity",
      "skills",
      goalTitle,
      "Protecting deep work time blocks, eliminating shallow friction, and optimizing daily pomodoros.",
      "How do I eliminate afternoon distraction traps and lock into 90-minute focus flow?"
    );
  }

  // 4. Creative & Passions Goals
  const combinedCreative = `${skillsText} ${lifestyleText} ${primaryText}`;
  if (combinedCreative.includes("music") || combinedCreative.includes("producer") || combinedCreative.includes("fl studio") || combinedCreative.includes("song") || combinedCreative.includes("beat")) {
    addMatch(
      "music",
      "creative",
      "Music Production & Sonic Architecture",
      "Structuring progressive FL Studio workflows, sound design templates, and 128 BPM creative flow.",
      "What chord voicing and drum sidechaining will elevate my 128 BPM progressive track?"
    );
  }

  if (combinedCreative.includes("film") || combinedCreative.includes("cinema") || combinedCreative.includes("video") || combinedCreative.includes("director") || combinedCreative.includes("camera") || combinedCreative.includes("youtube")) {
    addMatch(
      "cinema",
      "creative",
      "Cinematography & Visual Storytelling",
      "Developing cinematic visual grammar, composition framing, lighting aesthetics, and story pacing.",
      "How do I compose dynamic establishing shots that convey deep atmosphere and emotion?"
    );
  }

  // 5. Travel & Exploration
  if (combinedCreative.includes("travel") || combinedCreative.includes("mountain") || combinedCreative.includes("trip") || combinedCreative.includes("motorcycle") || combinedCreative.includes("ride") || combinedCreative.includes("da nang") || combinedCreative.includes("vietnam")) {
    addMatch(
      "travel",
      "travel",
      "High Altitude & Sovereign Expeditions",
      "Planning hill station expeditions, motorcycle itineraries, altitude acclimation, and travel routes.",
      "What gear and route checkpoints are critical for a high-altitude mountain expedition?"
    );
  }

  // 6. Lifestyle, Stillness & Spiritual Fortitude
  if (lifestyleText || primaryText.includes("peace") || primaryText.includes("mind") || primaryText.includes("zen") || primaryText.includes("faith")) {
    const goalTitle = goals?.lifestyleGoal || "Peace of mind, sovereign freedom, and work-life harmony";
    addMatch(
      "faith",
      "spirituality",
      goalTitle,
      "Deepening Vipassana mindfulness, philosophical fortitude, stillness, and spiritual presence.",
      "How do I return to clear, breath-centered stillness when mental friction arises?"
    );

    addMatch(
      "buddha_core",
      "lifestyle",
      goalTitle,
      "Holistic life alignment, synthesizing physical grit with inner stillness, guiding your North Star.",
      "How do I sustain harmony across my physique, intellect, and inner tranquility today?"
    );
  }

  // Default fallback if fewer than 3 matched
  if (matched.length === 0) {
    addMatch(
      "buddha_core",
      "lifestyle",
      "Sovereign Life Mastery",
      "The Supreme Architect synthesizing physical discipline, mental calm, and long-term vision.",
      "Synthesize my day: how do I balance my physical vessel, career velocity, and peace of mind?"
    );
    addMatch(
      "fitness",
      "health",
      "Athletic Physique & Vitality",
      "Biomechanic hypertrophy, joint preservation, and progressive physical conditioning.",
      "What is my ideal hypertrophy routine that protects my shoulders and builds athletic strength?"
    );
    addMatch(
      "finance",
      "finance",
      "Sovereign Capital & Freedom",
      "Resource allocation, long-term portfolio growth, and financial peace.",
      "How do I structure my capital velocity to build lasting sovereign freedom?"
    );
    addMatch(
      "mba",
      "skills",
      "Cognitive Mastery & Strategy",
      "Mental models, deliberate intellectual sprints, and structured high-leverage learning.",
      "What is the best strategy to maximize retention during my daily deep study window?"
    );
  }

  return matched;
}

export function isAgentMatchedToGoal(agentId: string, goals?: UserLongTermGoals): GoalMatchedAgent | undefined {
  const matches = getGoalMatchedAgents(goals);
  return matches.find((m) => m.agent.id === agentId);
}
