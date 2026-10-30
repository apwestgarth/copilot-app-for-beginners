import { describe, expect, it } from "vitest";
import { filterBooks, type BookFiltersState } from "../App";
import { books } from "../data/books";

const defaultFilters: BookFiltersState = {
  searchTerm: "",
  selectedGenre: "all",
  readingStatus: "all"
};

describe("filterBooks", () => {
  it.each(["hobbit", "tolkien"])(
    "returns the same book for lowercase and uppercase searches for %s",
    (searchTerm) => {
      const lowercaseResults = filterBooks(books, { ...defaultFilters, searchTerm });
      const uppercaseResults = filterBooks(books, {
        ...defaultFilters,
        searchTerm: searchTerm.toUpperCase()
      });

      expect(lowercaseResults.map((book) => book.title)).toEqual(["The Hobbit"]);
      expect(uppercaseResults).toEqual(lowercaseResults);
    }
  );

  it.each(["hObBiT", "tOlKiEn", "  HoBbIt  "])("matches the search %j", (searchTerm) => {
    const results = filterBooks(books, { ...defaultFilters, searchTerm });

    expect(results.map((book) => book.title)).toEqual(["The Hobbit"]);
  });

  it.each(["", "   "])("returns all books for the empty search %j", (searchTerm) => {
    expect(filterBooks(books, { ...defaultFilters, searchTerm })).toEqual(books);
  });

  it("returns no books when the search does not match", () => {
    expect(filterBooks(books, { ...defaultFilters, searchTerm: "nonexistent book" })).toEqual([]);
  });

  it.each([
    { selectedGenre: "Fantasy", readingStatus: "read", expectedTitles: ["The Hobbit"] },
    { selectedGenre: "Fantasy", readingStatus: "unread", expectedTitles: [] },
    { selectedGenre: "Mystery", readingStatus: "read", expectedTitles: [] }
  ] satisfies Array<{
    selectedGenre: string;
    readingStatus: BookFiltersState["readingStatus"];
    expectedTitles: string[];
  }>)("combines mixed-case search with $selectedGenre and $readingStatus filters", ({
    selectedGenre,
    readingStatus,
    expectedTitles
  }) => {
    const results = filterBooks(books, {
      ...defaultFilters,
      searchTerm: "hObBiT",
      selectedGenre,
      readingStatus
    });

    expect(results.map((book) => book.title)).toEqual(expectedTitles);
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
