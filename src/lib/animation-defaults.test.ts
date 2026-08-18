import { ensureAnimation, ensureAnimations } from "./animation-defaults";
import { ComponentConfig, AnimationConfig } from "@/types/landing";

describe("ensureAnimation (ComponentConfig overload)", () => {
  it("adds a type-specific default animation when missing", () => {
    const component = {
      id: "c1",
      type: "hero",
      order: 0,
      visible: true,
      config: { title: "Hi" },
    } as unknown as ComponentConfig;

    const result = ensureAnimation(component);

    expect((result.config as Record<string, unknown>).animation).toEqual({
      type: "fadeInUp",
      duration: 800,
      delay: 200,
    });
  });

  it("falls back to a generic default for an unknown component type", () => {
    const component = {
      id: "c2",
      type: "unknown-type",
      order: 0,
      visible: true,
      config: {},
    } as unknown as ComponentConfig;

    const result = ensureAnimation(component);

    expect((result.config as Record<string, unknown>).animation).toEqual({
      type: "fadeInUp",
      duration: 600,
      delay: 0,
    });
  });

  it("leaves an existing animation untouched", () => {
    const component = {
      id: "c3",
      type: "hero",
      order: 0,
      visible: true,
      config: { animation: { type: "none", duration: 0, delay: 0 } },
    } as unknown as ComponentConfig;

    const result = ensureAnimation(component);

    expect(result).toBe(component);
  });
});

describe("ensureAnimation (config + type overload)", () => {
  it("adds a default animation to a bare config object", () => {
    const config: { title: string; animation?: AnimationConfig } = { title: "Hi" };

    const result = ensureAnimation(config, "cta");

    expect(result.animation).toEqual({ type: "zoomIn", duration: 800, delay: 100 });
  });

  it("preserves an existing animation on the config object", () => {
    const config = { animation: { type: "none" as const, duration: 0, delay: 0 } };

    const result = ensureAnimation(config, "cta");

    expect(result).toBe(config);
  });
});

describe("ensureAnimations", () => {
  it("applies a default animation to every component in the array", () => {
    const components = [
      { id: "a", type: "hero", order: 0, visible: true, config: {} },
      { id: "b", type: "footer", order: 1, visible: true, config: {} },
    ] as unknown as ComponentConfig[];

    const result = ensureAnimations(components);

    expect((result[0].config as Record<string, unknown>).animation).toEqual({
      type: "fadeInUp",
      duration: 800,
      delay: 200,
    });
    expect((result[1].config as Record<string, unknown>).animation).toEqual({
      type: "none",
      duration: 0,
      delay: 0,
    });
  });
});
