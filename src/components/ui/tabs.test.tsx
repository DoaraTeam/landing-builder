import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

function ExampleTabs() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings</TabsContent>
      <TabsContent value="password">Password settings</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows the default tab's content and hides the others", () => {
    render(<ExampleTabs />);

    expect(screen.getByText("Account settings")).toBeVisible();
    expect(screen.queryByText("Password settings")).not.toBeInTheDocument();
  });

  it("switches content when another trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<ExampleTabs />);

    await user.click(screen.getByRole("tab", { name: "Password" }));

    expect(screen.getByText("Password settings")).toBeVisible();
    expect(screen.queryByText("Account settings")).not.toBeInTheDocument();
  });

  it("marks the active tab with aria-selected", async () => {
    const user = userEvent.setup();
    render(<ExampleTabs />);

    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("tab", { name: "Password" }));

    expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "false");
  });
});
