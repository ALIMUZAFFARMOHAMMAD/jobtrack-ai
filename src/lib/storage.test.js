import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadJSON, saveJSON, removeJSON } from "./storage.js";

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a value through saveJSON/loadJSON", () => {
    saveJSON("jobs", [{ id: 1, title: "PM" }]);
    expect(loadJSON("jobs", [])).toEqual([{ id: 1, title: "PM" }]);
  });

  it("returns the fallback when the key is missing", () => {
    expect(loadJSON("missing", "fallback")).toBe("fallback");
  });

  it("returns the fallback when the stored value is corrupted JSON", () => {
    window.localStorage.setItem("jobtrack_jobs", "{not valid json");
    expect(loadJSON("jobs", [])).toEqual([]);
  });

  it("removeJSON deletes the key", () => {
    saveJSON("user", { name: "Muzaffar" });
    removeJSON("user");
    expect(loadJSON("user", null)).toBeNull();
  });

  it("saveJSON does not throw when localStorage.setItem throws", () => {
    const spy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => saveJSON("jobs", [1, 2, 3])).not.toThrow();
    spy.mockRestore();
  });

  it("loadJSON/saveJSON/removeJSON no-op without throwing when window is undefined", () => {
    const original = globalThis.window;
    // @ts-ignore - simulate an SSR-like environment
    delete globalThis.window;
    try {
      expect(loadJSON("jobs", "fallback")).toBe("fallback");
      expect(() => saveJSON("jobs", [1])).not.toThrow();
      expect(() => removeJSON("jobs")).not.toThrow();
    } finally {
      globalThis.window = original;
    }
  });
});
