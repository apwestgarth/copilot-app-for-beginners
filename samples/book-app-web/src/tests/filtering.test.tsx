import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App, { filterBooks, type BookFiltersState } from "../App";
import { books } from "../data/books";

const defaultFilters: BookFiltersState = {
  searchTerm: "",
  selectedGenre: "all",
  readingStatus: "all"
};

describe("filterBooks", () => {
  it("matches title and author searches without depending on letter case", () => {
    const results = filterBooks(books, {
      ...defaultFilters,
      searchTerm: "hobbit"
    });

    expect(results.map((book) => book.title)).toEqual(["The Hobbit"]);
  });

  it("filters by genre and reading status together", () => {
    const results = filterBooks(books, {
      ...defaultFilters,
      selectedGenre: "Fantasy",
      readingStatus: "unread"
    });

    expect(results.map((book) => book.title)).toEqual(["The Night Circus"]);
  });
});

describe("Book filters", () => {
  it("keeps clear labels and shared guidance available after typing", async () => {
    const user = userEvent.setup();
    render(<App />);

    const filters = screen.getByRole("region", { name: "Book filters" });
    const helperText =
      "Filters work together. Results and reading stats update automatically.";
    const search = within(filters).getByRole("searchbox", {
      name: "Search by title or author",
      description: helperText
    });

    expect(within(filters).getByPlaceholderText("Enter a title or author")).toBe(search);
    expect(
      within(filters).getByRole("combobox", { name: "Genre", description: helperText })
    ).toBeTruthy();
    expect(
      within(filters).getByRole("combobox", { name: "Reading status", description: helperText })
    ).toBeTruthy();

    await user.type(search, "hobbit");

    expect(within(filters).getByText("Search by title or author")).toBeTruthy();
    expect(within(filters).getByText(helperText)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "The Hobbit" })).toBeTruthy();
  });

  it("updates results and stats when filters work together", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("searchbox", { name: "Search by title or author" }), "night");
    await user.selectOptions(screen.getByRole("combobox", { name: "Genre" }), "Fantasy");
    await user.selectOptions(screen.getByRole("combobox", { name: "Reading status" }), "unread");

    expect(screen.getByRole("heading", { name: "The Night Circus" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "1 books shown" })).toBeTruthy();
    const stats = screen.getByRole("region", { name: "Reading stats" });
    expect(within(stats).getByLabelText("Total: 1")).toBeTruthy();
    expect(within(stats).getByLabelText("Read: 0")).toBeTruthy();
    expect(within(stats).getByLabelText("Unread: 1")).toBeTruthy();
  });
});
