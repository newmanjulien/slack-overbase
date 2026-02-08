import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import type { Id } from "../../convex/_generated/dataModel.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";

export type RecurringFrequency = "weekly" | "monthly" | "quarterly";

export type RecurringDelivery =
  | "weekly_su"
  | "weekly_mo"
  | "weekly_tu"
  | "weekly_we"
  | "weekly_th"
  | "weekly_fr"
  | "weekly_sa"
  | "monthly_first_day"
  | "monthly_first_monday"
  | "monthly_second_monday"
  | "monthly_third_monday"
  | "monthly_fourth_monday"
  | "monthly_last_day"
  | "quarterly_first_day"
  | "quarterly_first_monday"
  | "quarterly_last_monday"
  | "quarterly_last_day";

export type RecurringDataSelection =
  | "data_prev_week"
  | "data_prev_month"
  | "data_prev_two_months"
  | "data_prev_quarter"
  | "data_prev_two_quarters"
  | "data_prev_year";

const RECURRING_FREQUENCIES: RecurringFrequency[] = ["weekly", "monthly", "quarterly"];
const RECURRING_DELIVERIES: RecurringDelivery[] = [
  "weekly_su",
  "weekly_mo",
  "weekly_tu",
  "weekly_we",
  "weekly_th",
  "weekly_fr",
  "weekly_sa",
  "monthly_first_day",
  "monthly_first_monday",
  "monthly_second_monday",
  "monthly_third_monday",
  "monthly_fourth_monday",
  "monthly_last_day",
  "quarterly_first_day",
  "quarterly_first_monday",
  "quarterly_last_monday",
  "quarterly_last_day",
];
const RECURRING_DATA_SELECTIONS: RecurringDataSelection[] = [
  "data_prev_week",
  "data_prev_month",
  "data_prev_two_months",
  "data_prev_quarter",
  "data_prev_two_quarters",
  "data_prev_year",
];

const isRecurringFrequency = (value: unknown): value is RecurringFrequency =>
  typeof value === "string" && RECURRING_FREQUENCIES.includes(value as RecurringFrequency);

const isRecurringDelivery = (value: unknown): value is RecurringDelivery =>
  typeof value === "string" && RECURRING_DELIVERIES.includes(value as RecurringDelivery);

const isRecurringDataSelection = (value: unknown): value is RecurringDataSelection =>
  typeof value === "string" &&
  RECURRING_DATA_SELECTIONS.includes(value as RecurringDataSelection);

export type RecurringQuestion = {
  id: Id<"recurring">;
  question: string;
  title: string;
  frequency: RecurringFrequency;
  frequencyLabel: string;
  delivery: RecurringDelivery | null;
  dataSelection: RecurringDataSelection | null;
};

const mapRecurring = (record: {
  _id: Id<"recurring">;
  question: string;
  title: string;
  frequency: string;
  frequencyLabel: string;
  delivery: string | null;
  dataSelection: string | null;
}): RecurringQuestion => ({
  id: record._id,
  question: record.question,
  title: record.title,
  frequency: isRecurringFrequency(record.frequency) ? record.frequency : "weekly",
  frequencyLabel: record.frequencyLabel,
  delivery: isRecurringDelivery(record.delivery) ? record.delivery : null,
  dataSelection: isRecurringDataSelection(record.dataSelection)
    ? record.dataSelection
    : null,
});

export const listRecurringQuestions = async (
  userId: string,
  teamContext: TeamContext,
): Promise<RecurringQuestion[]> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const questions = await client.query(api.slack.recurring.list, {
    userId,
    teamId: teamContext.teamId,
  });
  return Array.isArray(questions) ? questions.map(mapRecurring) : [];
};

export const getRecurringQuestion = async (
  userId: string,
  teamContext: TeamContext,
  id: Id<"recurring">,
): Promise<RecurringQuestion | null> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const question = await client.query(api.slack.recurring.getById, {
    userId,
    teamId: teamContext.teamId,
    id,
  });
  return question ? mapRecurring(question) : null;
};

export const createRecurringQuestion = async (
  userId: string,
  teamContext: TeamContext,
  payload: {
    question: string;
    title: string;
    frequency: RecurringFrequency;
    frequencyLabel: string;
    delivery: RecurringDelivery | null;
    dataSelection: RecurringDataSelection | null;
  },
): Promise<RecurringQuestion | null> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const record = await client.mutation(api.slack.recurring.create, {
    userId,
    teamId: teamContext.teamId,
    question: payload.question,
    title: payload.title,
    frequency: payload.frequency,
    frequencyLabel: payload.frequencyLabel,
    delivery: payload.delivery ?? null,
    dataSelection: payload.dataSelection ?? null,
  });
  return record ? mapRecurring(record) : null;
};

export const updateRecurringQuestion = async (
  userId: string,
  teamContext: TeamContext,
  id: Id<"recurring">,
  payload: {
    question: string;
    title: string;
    frequency: RecurringFrequency;
    frequencyLabel: string;
    delivery: RecurringDelivery | null;
    dataSelection: RecurringDataSelection | null;
  },
): Promise<RecurringQuestion | null> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const record = await client.mutation(api.slack.recurring.update, {
    userId,
    teamId: teamContext.teamId,
    id,
    question: payload.question,
    title: payload.title,
    frequency: payload.frequency,
    frequencyLabel: payload.frequencyLabel,
    delivery: payload.delivery ?? null,
    dataSelection: payload.dataSelection ?? null,
  });
  return record ? mapRecurring(record) : null;
};

export const deleteRecurringQuestion = async (
  userId: string,
  teamContext: TeamContext,
  id: Id<"recurring">,
): Promise<{ deleted: boolean }> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.slack.recurring.remove, {
    userId,
    teamId: teamContext.teamId,
    id,
  });
};
