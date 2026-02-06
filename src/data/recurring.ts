import { getConvexClient } from "./convex";
import { requireTeamContext, TeamContext } from "../lib/teamContext";

export type RecurringQuestion = {
  id: string;
  question: string;
  title: string;
  frequency: string;
  frequencyLabel: string;
  delivery: string | null;
  dataSelection: string | null;
};

const mapRecurring = (record: any): RecurringQuestion => ({
  id: record._id as string,
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
  const questions = await client.query("slack/recurring:list", {
    userId,
    teamId: teamContext.teamId,
  });
  return Array.isArray(questions) ? questions.map(mapRecurring) : [];
};

export const getRecurringQuestion = async (
  userId: string,
  teamContext: TeamContext,
  id: string,
): Promise<RecurringQuestion | null> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const question = await client.query("slack/recurring:getById", {
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
    delivery: string | null;
    dataSelection: string | null;
  },
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation("slack/recurring:create", {
    userId,
    teamId: teamContext.teamId,
    ...payload,
  });
};

export const updateRecurringQuestion = async (
  userId: string,
  teamContext: TeamContext,
  id: string,
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
  return client.mutation("slack/recurring:update", {
    userId,
    teamId: teamContext.teamId,
    id,
    ...payload,
  });
};

export const deleteRecurringQuestion = async (
  userId: string,
  teamContext: TeamContext,
  id: string,
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation("slack/recurring:remove", {
    userId,
    teamId: teamContext.teamId,
    id,
  });
};
