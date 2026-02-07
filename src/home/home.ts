export const HOME_SECTIONS = [
  "welcome",
  "templates",
  "recurring",
  "datasources",
  "settings",
] as const;

export type HomeSection = (typeof HOME_SECTIONS)[number];

export const normalizeHomeSection = (raw?: string): HomeSection => {
  if (raw && HOME_SECTIONS.includes(raw as HomeSection)) {
    return raw as HomeSection;
  }
  return "welcome";
};
