import { describe, it, expect } from "vitest";
import { parseOwnerRepo } from "./github";

describe("parseOwnerRepo", () => {
  it("parses a standard https GitHub URL", () => {
    expect(parseOwnerRepo("https://github.com/microsoft/typescript")).toEqual({
      owner: "microsoft",
      repo: "typescript",
    });
  });

  it("parses a URL without a protocol", () => {
    expect(parseOwnerRepo("github.com/facebook/react")).toEqual({
      owner: "facebook",
      repo: "react",
    });
  });

  it("strips a trailing slash", () => {
    expect(parseOwnerRepo("https://github.com/owner/repo/")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });

  it("strips a .git suffix", () => {
    expect(parseOwnerRepo("https://github.com/owner/repo.git")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });

  it("throws on a non-GitHub URL", () => {
    expect(() => parseOwnerRepo("https://gitlab.com/owner/repo")).toThrow(
      /Invalid GitHub URL/
    );
  });

  it("throws on path traversal or query characters in owner/repo", () => {
    for (const bad of [
      "https://github.com/../user",
      "https://github.com/owner/..",
      "https://github.com/../user?x=",
      "https://github.com/owner/repo#frag",
      "https://github.com/owner/re%2Fpo",
    ]) {
      expect(() => parseOwnerRepo(bad)).toThrow(/Invalid GitHub URL/);
    }
  });

  it("keeps a repo URL with extra path segments working", () => {
    expect(parseOwnerRepo("https://github.com/vercel/next.js/tree/canary")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("throws on a malformed string", () => {
    expect(() => parseOwnerRepo("not a url")).toThrow(/Invalid GitHub URL/);
  });
});
