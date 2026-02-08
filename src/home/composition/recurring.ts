import { listRecurringQuestions } from "../../data/recurring.js";
import { buildHomeRecurringBlocks } from "../views/recurring.js";
import type { HomeSectionSpec } from "../types.js";

export const recurringSection: HomeSectionSpec<"recurring"> = {
  load: async ({ userId, teamContext }) => {
    const recurring = await listRecurringQuestions(userId, teamContext);
    return {
      recurring: recurring.map((item) => ({
        id: item.id,
        title: item.title,
        question: item.question,
        frequencyLabel: item.frequencyLabel,
      })),
    };
  },
  view: (state) => buildHomeRecurringBlocks(state.recurring),
};
