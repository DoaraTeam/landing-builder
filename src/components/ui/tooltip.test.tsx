import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";

function ExampleTooltip() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Helpful hint</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe("Tooltip", () => {
  it("does not show its content until the trigger is hovered", () => {
    render(<ExampleTooltip />);
    expect(screen.queryByText("Helpful hint")).not.toBeInTheDocument();
  });

  it("shows its content on hover", async () => {
    const user = userEvent.setup();
    render(<ExampleTooltip />);

    await user.hover(screen.getByText("Hover me"));

    // Radix renders the tooltip text twice (visible content + a visually-hidden
    // role="tooltip" node for accessibility); the role query targets the latter uniquely.
    await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Helpful hint"));
  });

  it("associates the trigger with the tooltip content via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<ExampleTooltip />);

    const trigger = screen.getByText("Hover me");
    await user.hover(trigger);

    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
    });
  });
});
