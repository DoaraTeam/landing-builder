import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders with a placeholder", () => {
    render(<Textarea placeholder="Your message" />);
    expect(screen.getByPlaceholderText("Your message")).toBeInTheDocument();
  });

  it("accepts multiline typed input", async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Message" />);

    await user.type(screen.getByPlaceholderText("Message"), "Hello{enter}World");

    expect(screen.getByPlaceholderText("Message")).toHaveValue("Hello\nWorld");
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Textarea disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });
});
