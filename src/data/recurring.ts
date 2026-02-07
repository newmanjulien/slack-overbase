import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import type { Id } from "../../convex/_generated/dataModel.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";

export type RecurringQuestion = {
  id: Id<"recurringQuestions">;
  question: string;
  title: string;
  frequency: string;
  frequencyLabel: string;
  delivery: string | null;
  dataSelection: string | null;
};

const mapRecurring = (record: {
  _id: Id<"recurringQuestions">;
  question: string;
  title: string;
  frequency: string;
  frequencyLabel: string;
  delivery?: string;
  dataSelection?: string;
}): RecurringQuestion => ({
  id: record._id,
  question: record.question as string,
  title: record.title as string,
  frequency: record.frequency as string,
  frequencyLabel: record.frequencyLabel as string,
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
  id: Id<"recurringQuestions">,
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
    frequency: string;
    frequencyLabel: string;
    delivery: string | null | undefined;
    dataSelection: string | null | undefined;
  },
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.slack.recurring.create, {
    userId,
    teamId: teamContext.teamId,
    ...payload,
    ...(payload.delivery === null ? { delivery: undefined } : {}),
    ...(payload.dataSelection === null ? { dataSelection: undefined } : {}),
  });
};

export const updateRecurringQuestion = async (
  userId: string,
  teamContext: TeamContext,
  id: Id<"recurringQuestions">,
  payload: {
    question?: string;
    title?: string;
    frequency?: string;
    frequencyLabel?: string;
    delivery?: string | null;
    dataSelection?: string | null;
  },
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.slack.recurring.update, {
    userId,
    teamId: teamContext.teamId,
    id,
    ...payload,
    ...(payload.delivery === null ? { delivery: undefined } : {}),
    ...(payload.dataSelection === null ? { dataSelection: undefined } : {}),
  });
};

export const deleteRecurringQuestion = async (
  userId: string,
  teamContext: TeamContext,
  id: Id<"recurringQuestions">,
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.slack.recurring.remove, {
    userId,
    teamId: teamContext.teamId,
    id,
  });
};
