export const PORTAL_PATHS = {
  connectors: "/connectors",
  people: "/people",
  payments: "/payments",
} as const;

export type PortalPathKey = keyof typeof PORTAL_PATHS;
export type PortalPath = (typeof PORTAL_PATHS)[PortalPathKey];

export const PORTAL_ALLOWED_NEXT = new Set<PortalPath>(Object.values(PORTAL_PATHS));
