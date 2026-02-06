export type SlackPayload = {
  context?: { teamId?: string; team_id?: string; userId?: string; user_id?: string };
  body?: {
    team_id?: string;
    team?: { id?: string } | null;
    user?: { id?: string } | null;
    user_id?: string;
    trigger_id?: string;
  };
  event?: { team?: string; user?: string };
  message?: { team?: string; user?: string };
};

export const extractTeamId = (payload: SlackPayload): string | null => {
  return (
    payload.context?.teamId ||
    payload.context?.team_id ||
    payload.body?.team_id ||
    payload.body?.team?.id ||
    payload.event?.team ||
    payload.message?.team ||
    null
  );
};

export const extractUserId = (payload: SlackPayload): string | null => {
  return (
    payload.context?.userId ||
    payload.context?.user_id ||
    payload.body?.user?.id ||
    payload.body?.user_id ||
    payload.event?.user ||
    payload.message?.user ||
    null
  );
};

export const extractTriggerId = (payload: SlackPayload): string | null => {
  return payload.body?.trigger_id || null;
};
