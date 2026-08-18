import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./switch";

describe("Switch", () => {
  it("is unchecked by default", () => {
    render(<Switch aria-label="Enable" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("toggles when clicked in uncontrolled mode", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Enable" />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("calls onCheckedChange with the new state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    render(<Switch aria-label="Enable" onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("switch"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    render(<Switch aria-label="Enable" disabled onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("switch"));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
