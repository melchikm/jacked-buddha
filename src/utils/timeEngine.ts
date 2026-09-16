import { useState, useEffect } from "react";

export type TimeOfDayPeriod = "morning" | "afternoon" | "evening" | "night";

export interface TimeGreetingData {
  greeting: string;
  period: TimeOfDayPeriod;
  isNight: boolean;
  isMorning: boolean;
  isAfternoon: boolean;
  isEvening: boolean;
  emoji: string;
  iconName: "Sun" | "Sunrise" | "Sunset" | "Moon";
  phaseLabel: string;
  subtitle: string;
  bgGradient: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

/**
 * Calculates time-aware greeting and contextual status based on the hour:
 * - Morning: 5:00 AM (05:00) to 11:59 AM (11:59) -> "Good Morning"
 * - Afternoon: 12:00 PM (12:00) to 4:59 PM (16:59) -> "Good Afternoon"
 * - Evening: 5:00 PM (17:00) to 8:59 PM (20:59) -> "Good Evening"
 * - Night: 9:00 PM (21:00) to 4:59 AM (04:59) -> "Good Night"
 */
export function getTimeGreeting(date: Date = new Date()): TimeGreetingData {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: "Good Morning",
      period: "morning",
      isMorning: true,
      isAfternoon: false,
      isEvening: false,
      isNight: false,
      emoji: "🌅",
      iconName: "Sunrise",
      phaseLabel: "Morning Dawn",
      subtitle: "Time to awaken your Vita potential. Clarify your mind, hydrate, and execute today's first sprint.",
      bgGradient: "from-amber-500/15 via-orange-500/10 to-transparent",
      accentColor: "text-amber-400",
      badgeBg: "bg-amber-500/15",
      badgeBorder: "border-amber-500/30",
      badgeText: "text-amber-300"
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: "Good Afternoon",
      period: "afternoon",
      isMorning: false,
      isAfternoon: true,
      isEvening: false,
      isNight: false,
      emoji: "☀️",
      iconName: "Sun",
      phaseLabel: "Midday Focus",
      subtitle: "Peak daylight momentum. Drive through your GMAT study blocks and heavy hypertrophy training.",
      bgGradient: "from-sky-500/15 via-indigo-500/10 to-transparent",
      accentColor: "text-sky-400",
      badgeBg: "bg-sky-500/15",
      badgeBorder: "border-sky-500/30",
      badgeText: "text-sky-300"
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: "Good Evening",
      period: "evening",
      isMorning: false,
      isAfternoon: false,
      isEvening: true,
      isNight: false,
      emoji: "🌆",
      iconName: "Sunset",
      phaseLabel: "Evening Twilight",
      subtitle: "Sunset synthesis. Lock in your macro protein targets, review daily wins, and unwind cognitive debt.",
      bgGradient: "from-purple-500/15 via-pink-500/10 to-transparent",
      accentColor: "text-purple-400",
      badgeBg: "bg-purple-500/15",
      badgeBorder: "border-purple-500/30",
      badgeText: "text-purple-300"
    };
  } else {
    // Night: 9:00 PM (21:00) through 4:59 AM (04:59)
    return {
      greeting: "Good Night",
      period: "night",
      isMorning: false,
      isAfternoon: false,
      isEvening: false,
      isNight: true,
      emoji: "🌙",
      iconName: "Moon",
      phaseLabel: "Night Restoration",
      subtitle: "Sacred stillness & deep CNS recovery. Purify the day's tension, breathe deep, and prepare for restorative sleep.",
      bgGradient: "from-indigo-900/30 via-slate-900/40 to-transparent",
      accentColor: "text-indigo-300",
      badgeBg: "bg-indigo-500/20",
      badgeBorder: "border-indigo-500/40",
      badgeText: "text-indigo-200"
    };
  }
}

/**
 * Calculates how much of the 24-hour day has elapsed as a percentage (0-100)
 */
export function getDayProgressPercent(date: Date = new Date()): number {
  const totalSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  const daySeconds = 86400;
  return Math.min(100, Math.max(0, Math.round((totalSeconds / daySeconds) * 100)));
}

/**
 * Custom React hook for live second-by-second time tracking and time-of-day awareness
 */
export function useLiveTime() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // Update immediately and on every second
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const greetingData = getTimeGreeting(now);
  const dayProgress = getDayProgressPercent(now);

  const formattedTime12 = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const formattedTimeShort = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  const formattedTime24 = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const formattedDateShort = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  return {
    now,
    greetingData,
    dayProgress,
    formattedTime12,
    formattedTimeShort,
    formattedTime24,
    formattedDate,
    formattedDateShort,
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    isNight: greetingData.isNight,
    isMorning: greetingData.isMorning,
    isAfternoon: greetingData.isAfternoon,
    isEvening: greetingData.isEvening,
    greeting: greetingData.greeting,
    phaseLabel: greetingData.phaseLabel,
    subtitle: greetingData.subtitle
  };
}
