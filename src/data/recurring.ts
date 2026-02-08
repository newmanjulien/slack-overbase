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
  frequency: RecurringFrequency;
  frequencyLabel: string;
  delivery: RecurringDelivery | null;
  dataSelection: RecurringDataSelection | null;
}): RecurringQuestion => ({
  id: record._id,
  question: record.question,
  title: record.title,
  frequency: record.frequency,
  frequencyLabel: record.frequencyLabel,
  delivery: record.delivery ?? null,
  dataSelection: record.dataSelection ?? null,
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
