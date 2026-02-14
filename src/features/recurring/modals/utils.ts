import type { PlainTextOption } from "@slack/types";
import type { RecurringFrequency } from "../../../data/recurring.js";

export const resolveOption = (
  options: PlainTextOption[],
  selectedValue?: string | null,
): PlainTextOption | undefined =>
  options.find((option) => option.value === selectedValue) || options[0];

const getTimeZoneOffsetMinutes = (date: Date, timeZone: string): number => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});
    const utcTime = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    return (utcTime - date.getTime()) / 60000;
  } catch {
    return 0;
  }
};

const getDateForTimeZone = (year: number, month: number, day: number, timeZone: string): Date => {
  const utcMidnight = Date.UTC(year, month, day, 0, 0, 0);
  const offsetMinutes = getTimeZoneOffsetMinutes(new Date(utcMidnight), timeZone);
  return new Date(utcMidnight - offsetMinutes * 60000);
};

const getTodayInTimeZone = (timeZone: string): Date => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(new Date()).reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});
    return getDateForTimeZone(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      timeZone,
    );
  } catch {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
};

export const formatFirstDeliveryDate = (date: Date | null, timeZone: string): string => {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }
};

const getNextWeeklyDate = (now: Date, weekdayIndex?: number): Date | null => {
  if (typeof weekdayIndex !== "number") return null;
  const next = new Date(now);
  const currentDay = next.getUTCDay();
  let diff = (weekdayIndex - currentDay + 7) % 7;
  if (diff === 0) diff = 7;
  next.setUTCDate(next.getUTCDate() + diff);
  return next;
};

const getNthWeekdayOfMonth = (
  year: number,
  month: number,
  weekdayIndex: number,
  occurrence: number,
): Date | null => {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const offset = (weekdayIndex - firstOfMonth.getUTCDay() + 7) % 7;
  const day = 1 + offset + (occurrence - 1) * 7;
  const date = new Date(Date.UTC(year, month, day));
  return date.getUTCMonth() === month ? date : null;
};

const getLastWeekdayOfMonth = (
  year: number,
  month: number,
  weekdayIndex: number,
): Date => {
  const lastOfMonth = new Date(Date.UTC(year, month + 1, 0));
  const offset = (lastOfMonth.getUTCDay() - weekdayIndex + 7) % 7;
  return new Date(Date.UTC(year, month, lastOfMonth.getUTCDate() - offset));
};

export const getFirstDeliveryDate = (
  frequency: RecurringFrequency | undefined,
  delivery: string | undefined,
  timeZone: string,
): Date | null => {
  if (!frequency || !delivery) return null;

  const today = getTodayInTimeZone(timeZone || "UTC");

  if (frequency === "weekly") {
    const weekdayMap: Record<string, number> = {
      weekly_su: 0,
      weekly_mo: 1,
      weekly_tu: 2,
      weekly_we: 3,
      weekly_th: 4,
      weekly_fr: 5,
      weekly_sa: 6,
    };
    return getNextWeeklyDate(today, weekdayMap[delivery]);
  }

  if (frequency === "monthly") {
    const getMonthlyDate = (year: number, month: number): Date | null => {
      const deliveryMap: Record<string, () => Date | null> = {
        monthly_first_day: () => new Date(Date.UTC(year, month, 1)),
        monthly_first_monday: () => getNthWeekdayOfMonth(year, month, 1, 1),
        monthly_second_monday: () => getNthWeekdayOfMonth(year, month, 1, 2),
        monthly_third_monday: () => getNthWeekdayOfMonth(year, month, 1, 3),
        monthly_fourth_monday: () => getNthWeekdayOfMonth(year, month, 1, 4),
        monthly_last_day: () => new Date(Date.UTC(year, month + 1, 0)),
      };
      return deliveryMap[delivery]?.() || null;
    };

    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const currentDate = getMonthlyDate(year, month);
    if (currentDate && currentDate > today) {
      return currentDate;
    }
    const nextMonth = month + 1;
    const nextYear = year + Math.floor(nextMonth / 12);
    const normalizedMonth = nextMonth % 12;
    return getMonthlyDate(nextYear, normalizedMonth);
  }

  if (frequency === "quarterly") {
    const year = today.getUTCFullYear();
    const quarterStartMonth = Math.floor(today.getUTCMonth() / 3) * 3;
    const quarterEndMonth = quarterStartMonth + 2;
    const deliveryMap: Record<string, () => Date | null> = {
      quarterly_first_day: () => new Date(Date.UTC(year, quarterStartMonth, 1)),
      quarterly_first_monday: () => getNthWeekdayOfMonth(year, quarterStartMonth, 1, 1),
      quarterly_last_monday: () => getLastWeekdayOfMonth(year, quarterEndMonth, 1),
      quarterly_last_day: () => new Date(Date.UTC(year, quarterEndMonth + 1, 0)),
    };
    const currentDate = deliveryMap[delivery]?.() || null;
    if (currentDate && currentDate > today) {
      return currentDate;
    }
    const nextQuarterStart = quarterStartMonth + 3;
    const nextYear = year + Math.floor(nextQuarterStart / 12);
    const normalizedStart = nextQuarterStart % 12;
    const normalizedEnd = normalizedStart + 2;
    const nextDeliveryMap: Record<string, () => Date | null> = {
      quarterly_first_day: () => new Date(Date.UTC(nextYear, normalizedStart, 1)),
      quarterly_first_monday: () => getNthWeekdayOfMonth(nextYear, normalizedStart, 1, 1),
      quarterly_last_monday: () => getLastWeekdayOfMonth(nextYear, normalizedEnd, 1),
      quarterly_last_day: () => new Date(Date.UTC(nextYear, normalizedEnd + 1, 0)),
    };
    return nextDeliveryMap[delivery]?.() || null;
  }

  return null;
};

export const buildRecurringMetadata = ({
  questionId,
  source,
}: {
  questionId?: string;
  source?: string;
} = {}): string =>
  JSON.stringify({
    questionId: questionId || "",
    source: source || "home",
  });
