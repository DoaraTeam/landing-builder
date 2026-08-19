import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies the default variant classes", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toHaveClass("bg-primary", "border-transparent");
  });

  it("applies the destructive variant classes", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error")).toHaveClass("bg-destructive");
  });

  it("applies the outline variant classes", () => {
    render(<Badge variant="outline">Draft</Badge>);
    const badge = screen.getByText("Draft");
    expect(badge).toHaveClass("text-foreground");
    expect(badge).not.toHaveClass("border-transparent");
  });

  it("merges a custom className", () => {
    render(<Badge className="my-badge">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("my-badge");
  });
});
