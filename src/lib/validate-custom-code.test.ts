import { validateCustomCode } from "./validate-custom-code";

describe("validateCustomCode", () => {
  it("allows empty/whitespace code", () => {
    expect(validateCustomCode("")).toBeNull();
    expect(validateCustomCode("   \n  ")).toBeNull();
  });

  it("allows a well-formed analytics snippet", () => {
    const code = `<script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      if (window.location.href.length < 999) { gtag('js', new Date()); }
    </script>`;
    expect(validateCustomCode(code)).toBeNull();
  });

  it("allows script + noscript fallback (Facebook Pixel style)", () => {
    const code = `<script>console.log("<3 pixels")</script><noscript><img src="x.png" /></noscript>`;
    expect(validateCustomCode(code)).toBeNull();
  });

  it("ignores stray < and > inside a script body", () => {
    const code = `<script>if (1 < 2 && 3 > 2) { console.log("ok"); }</script>`;
    expect(validateCustomCode(code)).toBeNull();
  });

  it("rejects a missing closing tag", () => {
    const code = `<script>console.log("oops")`;
    expect(validateCustomCode(code)).toMatch(/unbalanced/i);
  });

  it("rejects a mismatched closing tag", () => {
    const code = `<div><span></div></span>`;
    expect(validateCustomCode(code)).toMatch(/unbalanced/i);
  });

  it("rejects a pasted full HTML document", () => {
    expect(validateCustomCode("<!DOCTYPE html><html><body>hi</body></html>")).toMatch(
      /full html document/i
    );
    expect(validateCustomCode("<head><title>x</title></head>")).toMatch(/full html document/i);
  });

  it("rejects code over the length cap", () => {
    const code = `<script>${"a".repeat(60_000)}</script>`;
    expect(validateCustomCode(code)).toMatch(/too long/i);
  });
});
