import { render, screen } from "@testing-library/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./carousel";

describe("Carousel", () => {
  it("renders its slides", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
    expect(screen.getByRole("region")).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("disables the previous button before any slide has been scrolled", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );

    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
  });

  it("throws when CarouselContent is rendered outside of a Carousel", () => {
    // Swallow the expected React error log for this negative test case.
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<CarouselContent>Orphan</CarouselContent>)).toThrow(
      "useCarousel must be used within a <Carousel />"
    );

    spy.mockRestore();
  });
});
