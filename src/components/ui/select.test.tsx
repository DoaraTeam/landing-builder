import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";

function ExampleSelect({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Pick a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="modern">Modern</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<ExampleSelect />);
    expect(screen.getByText("Pick a theme")).toBeInTheDocument();
  });

  it("lists its options once opened", async () => {
    const user = userEvent.setup();
    render(<ExampleSelect />);

    await user.click(screen.getByRole("combobox"));

    expect(await screen.findByRole("option", { name: "Modern" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dark" })).toBeInTheDocument();
  });

  it("calls onValueChange and updates the trigger when an option is picked", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<ExampleSelect onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Dark" }));

    expect(onValueChange).toHaveBeenCalledWith("dark");
    expect(screen.getByRole("combobox")).toHaveTextContent("Dark");
  });
});
