import type { FunctionArgs, FunctionReturnType } from "convex/server";
import { api } from "../convex/_generated/api.js";

export { api };

export type PortalId = string;

export type IssueCodeArgs = FunctionArgs<typeof api.portal.auth.issueCode>;
export type IssueCodeResult = FunctionReturnType<typeof api.portal.auth.issueCode>;

export type ConsumeCodeArgs = FunctionArgs<typeof api.portal.auth.consumeCode>;
export type ConsumeCodeResult = FunctionReturnType<typeof api.portal.auth.consumeCode>;

export type GetSessionArgs = FunctionArgs<typeof api.portal.auth.getSession>;
export type GetSessionResult = FunctionReturnType<typeof api.portal.auth.getSession>;
export type PortalSession = NonNullable<GetSessionResult>;

export type GetAllPeopleArgs = FunctionArgs<typeof api.portal.people.getAllPeople>;
export type GetAllPeopleResult = FunctionReturnType<typeof api.portal.people.getAllPeople>;
export type PortalPerson = GetAllPeopleResult[number];
export type PersonStatus = NonNullable<PortalPerson["status"]>;

export type AddPersonArgs = FunctionArgs<typeof api.portal.people.addPerson>;
export type AddPersonResult = FunctionReturnType<typeof api.portal.people.addPerson>;

export type DeletePeopleArgs = FunctionArgs<typeof api.portal.people.deletePeople>;
export type DeletePeopleResult = FunctionReturnType<typeof api.portal.people.deletePeople>;

export type GetAllConnectorsArgs = FunctionArgs<typeof api.portal.connectors.getAllConnectors>;
export type GetAllConnectorsResult =
  FunctionReturnType<typeof api.portal.connectors.getAllConnectors>;
export type PortalConnector = GetAllConnectorsResult[number];
export type ConnectorStatus = PortalConnector["status"];

export type UpsertConnectorArgs = FunctionArgs<typeof api.portal.connectors.upsertConnector>;
export type UpsertConnectorResult =
  FunctionReturnType<typeof api.portal.connectors.upsertConnector>;

export type GetTiersArgs = FunctionArgs<typeof api.portal.billing.getTiers>;
export type GetTiersResult = FunctionReturnType<typeof api.portal.billing.getTiers>;
export type PortalTier = GetTiersResult[number];
export type TierId = PortalTier["tierId"];

export type SeedTiersArgs = FunctionArgs<typeof api.portal.billing.seedTiers>;
export type SeedTiersResult = FunctionReturnType<typeof api.portal.billing.seedTiers>;

export type GetBillingArgs = FunctionArgs<typeof api.portal.billing.getBilling>;
export type GetBillingResult = FunctionReturnType<typeof api.portal.billing.getBilling>;
export type PortalBilling = GetBillingResult;

export type SetTierArgs = FunctionArgs<typeof api.portal.billing.setTier>;
export type SetTierResult = FunctionReturnType<typeof api.portal.billing.setTier>;

export * from "./paths.js";
export * from "./relay.js";
