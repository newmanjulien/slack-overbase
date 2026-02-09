import { buildRecurringBlocks } from "../../features/recurring/view.js";
import type { HomeSectionDataMap } from "../types.js";

export const buildHomeRecurringBlocks = (
  recurring: HomeSectionDataMap["recurring"]["recurring"],
) => buildRecurringBlocks(recurring);
