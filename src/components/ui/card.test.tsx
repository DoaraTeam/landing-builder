import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";

describe("Card", () => {
  it("renders a full card composition", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Best value</CardDescription>
        </CardHeader>
        <CardContent>Details here</CardContent>
        <CardFooter>Footer text</CardFooter>
      </Card>
    );

    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Best value")).toBeInTheDocument();
    expect(screen.getByText("Details here")).toBeInTheDocument();
    expect(screen.getByText("Footer text")).toBeInTheDocument();
  });

  it("applies the base card classes and merges a custom className", () => {
    render(<Card className="extra-class">Body</Card>);
    const card = screen.getByText("Body");
    expect(card).toHaveClass("rounded-xl", "border", "extra-class");
  });

  it("forwards refs to the underlying DOM node", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={ref}>Body</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
