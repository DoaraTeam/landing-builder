import { render } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("defaults to a horizontal, decorative separator", () => {
    const { container } = render(<Separator data-testid="sep" />);
    const separator = container.querySelector('[data-testid="sep"]') as HTMLElement;

    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    expect(separator).toHaveClass("h-[1px]", "w-full");
    // decorative separators are hidden from the accessibility tree
    expect(separator).toHaveAttribute("role", "none");
  });

  it("renders a vertical separator with the matching classes", () => {
    const { container } = render(<Separator orientation="vertical" data-testid="sep" />);
    const separator = container.querySelector('[data-testid="sep"]') as HTMLElement;

    expect(separator).toHaveAttribute("data-orientation", "vertical");
    expect(separator).toHaveClass("h-full", "w-[1px]");
  });

  it("exposes a separator role when not decorative", () => {
    const { container } = render(<Separator decorative={false} data-testid="sep" />);
    const separator = container.querySelector('[data-testid="sep"]') as HTMLElement;

    expect(separator).toHaveAttribute("role", "separator");
  });
});
