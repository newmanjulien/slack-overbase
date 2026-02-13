import { describe, expect, it } from "vitest";
import {
  buildRelayFileSignaturePayload,
  signRelayFilePayload,
  verifyRelayFileSignature,
} from "../../shared/relay/contract.js";

describe("relay file signing", () => {
  it("creates stable payloads", () => {
    const payload = buildRelayFileSignaturePayload({
      teamId: "T123",
      fileId: "F123",
      expiresAt: 1700000000000,
      filename: "report.pdf",
      mimeType: "application/pdf",
      size: 12345,
      token: "tok_abc",
    });

    expect(payload).toBe("T123:F123:1700000000000:report.pdf:application/pdf:12345:tok_abc");
  });

  it("verifies valid signatures", () => {
    const secret = "test-secret";
    const payload = {
      teamId: "T123",
      fileId: "F123",
      expiresAt: 1700000000000,
      filename: "report.pdf",
      mimeType: "application/pdf",
      size: 12345,
      token: "tok_abc",
    };
    const sig = signRelayFilePayload(secret, payload);
    expect(verifyRelayFileSignature(secret, payload, sig)).toBe(true);
  });

  it("rejects tampered signatures", () => {
    const secret = "test-secret";
    const payload = {
      teamId: "T123",
      fileId: "F123",
      expiresAt: 1700000000000,
      filename: "report.pdf",
      mimeType: "application/pdf",
      size: 12345,
      token: "tok_abc",
    };
    const sig = signRelayFilePayload(secret, payload);
    const tampered = { ...payload, filename: "report-2.pdf" };
    expect(verifyRelayFileSignature(secret, tampered, sig)).toBe(false);
  });
});
