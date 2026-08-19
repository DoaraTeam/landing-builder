import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "./sheet";

describe("Sheet", () => {
  it("is closed by default and opens via its trigger", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open menu</SheetTrigger>
        <SheetContent>
          <SheetTitle>Menu</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByText("Open menu"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  it("defaults to sliding in from the right", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Right sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText("Open"));

    expect(screen.getByRole("dialog")).toHaveClass("right-0");
  });

  it("applies the requested side variant", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>Left sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText("Open"));

    expect(screen.getByRole("dialog")).toHaveClass("left-0");
  });
});
