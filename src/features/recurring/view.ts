import type { KnownBlock, PlainTextOption } from "@slack/types";
import type {
  RecurringDataSelection,
  RecurringDelivery,
  RecurringFrequency,
} from "../../data/recurring.js";

type LabeledOption = { label: string; value: string };

const recurringDeliveryOptions: Record<RecurringFrequency, LabeledOption[]> = {
  weekly: [
    { label: "Sundays", value: "weekly_su" },
    { label: "Mondays", value: "weekly_mo" },
    { label: "Tuesdays", value: "weekly_tu" },
    { label: "Wednesdays", value: "weekly_we" },
    { label: "Thursdays", value: "weekly_th" },
    { label: "Fridays", value: "weekly_fr" },
    { label: "Saturdays", value: "weekly_sa" },
  ],
  monthly: [
    { label: "First day of the month", value: "monthly_first_day" },
    { label: "First Monday of the month", value: "monthly_first_monday" },
    { label: "Second Monday of the month", value: "monthly_second_monday" },
    { label: "Third Monday of the month", value: "monthly_third_monday" },
    { label: "Fourth Monday of the month", value: "monthly_fourth_monday" },
    { label: "Last day of the month", value: "monthly_last_day" },
  ],
  quarterly: [
    { label: "First day of the quarter", value: "quarterly_first_day" },
    { label: "First Monday of the quarter", value: "quarterly_first_monday" },
    { label: "Last Monday of the quarter", value: "quarterly_last_monday" },
    { label: "Last day of the quarter", value: "quarterly_last_day" },
  ],
};

const recurringDataOptions: Record<RecurringFrequency, LabeledOption[]> = {
  weekly: [{ label: "Data from the previous week", value: "data_prev_week" }],
  monthly: [
    { label: "Data from the previous month", value: "data_prev_month" },
    { label: "Data from the previous 2 months", value: "data_prev_two_months" },
  ],
  quarterly: [
    { label: "Data from the previous quarter", value: "data_prev_quarter" },
    { label: "Data from the previous 2 quarters", value: "data_prev_two_quarters" },
    { label: "Data from the previous year", value: "data_prev_year" },
  ],
};

export const buildRecurringFrequencyOptions = (): PlainTextOption[] => [
  { text: { type: "plain_text", text: "Weekly" }, value: "weekly" },
  { text: { type: "plain_text", text: "Monthly" }, value: "monthly" },
  { text: { type: "plain_text", text: "Quarterly" }, value: "quarterly" },
];

export const buildRecurringDeliveryOptions = (
  frequency: RecurringFrequency,
): PlainTextOption[] =>
  recurringDeliveryOptions[frequency].map((option) => ({
    text: { type: "plain_text", text: option.label },
    value: option.value,
  }));

export const buildRecurringDataOptions = (
  frequency: RecurringFrequency,
): PlainTextOption[] =>
  recurringDataOptions[frequency].map((option) => ({
    text: { type: "plain_text", text: option.label },
    value: option.value,
  }));

export const buildRecurringQuestionBlocks = (
  questions: Array<{ id: string; title: string; frequencyLabel: string }>,
): KnownBlock[] =>
  questions.map((question) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${question.title}*\n${question.frequencyLabel}`,
    },
    accessory: {
      type: "button",
      text: { type: "plain_text", text: "Edit" },
      action_id: "edit_recurring_question",
      value: question.id,
    },
  }));

export const buildRecurringBlocks = (
  recurringQuestions: Array<{ id: string; title: string; frequencyLabel: string }>,
): KnownBlock[] => [
  {
    type: "header",
    text: { type: "plain_text", text: "Recurring" },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Schedule questions to run on a recurring cadence",
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "Add recurring question" },
        action_id: "add_recurring_question",
      },
    ],
  },
  ...(recurringQuestions.length > 0
    ? buildRecurringQuestionBlocks(recurringQuestions)
    : [
        {
          type: "section",
          text: { type: "mrkdwn", text: "No recurring questions yet" },
        },
      ]),
];

export const isRecurringFrequency = (value: string): value is RecurringFrequency =>
  value === "weekly" || value === "monthly" || value === "quarterly";

export const isRecurringDelivery = (value: string): value is RecurringDelivery =>
  Object.values(recurringDeliveryOptions)
    .flat()
    .some((option) => option.value === value);

export const isRecurringDataSelection = (
  value: string,
): value is RecurringDataSelection =>
  Object.values(recurringDataOptions)
    .flat()
    .some((option) => option.value === value);
