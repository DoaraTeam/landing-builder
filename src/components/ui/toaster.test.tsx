import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "./toaster";
import { toast } from "@/hooks/use-toast";

// `toast`/`useToast` share one module-level store, so state leaks across tests
// in this file. Each test below dismisses the toast(s) it created before finishing.
describe("Toaster", () => {
  it("renders nothing when there are no toasts", () => {
    render(<Toaster />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders a toast's title and description once triggered", async () => {
    render(<Toaster />);

    const { dismiss } = toast({ title: "Saved", description: "Your changes were saved" });

    expect(await screen.findByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Your changes were saved")).toBeInTheDocument();

    dismiss();
  });

  it("closes a toast when its close button is clicked", async () => {
    const user = userEvent.setup();
    render(<Toaster />);

    toast({ title: "Dismissable toast" });
    const closeButton = (await screen.findByText("Dismissable toast"))
      .closest("li")
      ?.querySelector("[toast-close]") as HTMLElement;

    await user.click(closeButton);

    await waitFor(() => expect(screen.queryByText("Dismissable toast")).not.toBeInTheDocument());
  });
});
