import { describe, it, expect } from "vitest";
import { extractTeamId, extractUserId } from "../src/lib/slackPayload";

describe("slack payload helpers", () => {
  it("extracts teamId from event payload", () => {
    const teamId = extractTeamId({ event: { team: "T123" } });
    expect(teamId).toBe("T123");
  });

  it("extracts teamId from interactive payload", () => {
    const teamId = extractTeamId({ body: { team: { id: "T999" } } });
    expect(teamId).toBe("T999");
  });

  it("extracts userId from message payload", () => {
    const userId = extractUserId({ message: { user: "U123" } });
    expect(userId).toBe("U123");
  });
});
