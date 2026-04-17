import { describe, it, expect, beforeEach } from "vitest";
import { createProvider, resetProvider, getProvider } from "../index.js";
import type { ProviderName } from "../index.js";

describe("createProvider", () => {
  beforeEach(() => resetProvider());

  it("defaults to anthropic", () => {
    delete process.env.GIGOPS_PROVIDER;
    const p = createProvider();
    expect(p.name).toBe("anthropic");
  });

  it.each(["anthropic", "openai", "ollama"] satisfies ProviderName[])(
    "creates %s provider",
    (name) => {
      const p = createProvider(name);
      expect(p.name).toBe(name);
    }
  );

  it("throws on unknown provider", () => {
    expect(() => createProvider("nope" as ProviderName)).toThrow("Unknown provider");
  });

  it("getProvider returns singleton", () => {
    delete process.env.GIGOPS_PROVIDER;
    const a = getProvider();
    const b = getProvider();
    expect(a).toBe(b);
  });

  it("resetProvider clears singleton", () => {
    delete process.env.GIGOPS_PROVIDER;
    const a = getProvider();
    resetProvider();
    const b = getProvider();
    expect(a).not.toBe(b);
  });

  it("respects GIGOPS_PROVIDER env var", () => {
    process.env.GIGOPS_PROVIDER = "openai";
    resetProvider();
    const p = getProvider();
    expect(p.name).toBe("openai");
    delete process.env.GIGOPS_PROVIDER;
  });
});
