export type TemplateSectionOption = {
  value: string;
  label: string;
};

export const templateSectionOptions: TemplateSectionOption[] = [
  { value: "cro", label: "CRO templates" },
  { value: "cmo", label: "CMO templates" },
  { value: "cco", label: "CCO templates" },
  { value: "cpo", label: "CPO templates" },
  { value: "all", label: "See all" },
];

export const getDefaultTemplateSection = () => templateSectionOptions[0]?.value || "cro";
