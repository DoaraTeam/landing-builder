import { render, screen } from "@testing-library/react";
import { Label } from "./label";
import { Input } from "./input";

describe("Label", () => {
  it("renders its text", () => {
    render(<Label>Email address</Label>);
    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("associates with a form control via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" />
      </>
    );

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });
});
